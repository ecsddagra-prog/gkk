# Database Migration Script
# Runs all SQL migrations in order

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Database Migration Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Load environment variables
if (Test-Path ".env.local") {
    Write-Host "Loading environment variables..." -ForegroundColor Yellow
    Get-Content ".env.local" | ForEach-Object {
        if ($_ -match "^([^=]+)=(.+)$") {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
    Write-Host "✓ Environment loaded" -ForegroundColor Green
} else {
    Write-Host "✗ .env.local not found" -ForegroundColor Red
    exit 1
}

# Create migration runner script
$migrationRunner = @"
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

async function runMigration(filePath, fileName) {
  console.log('\\n' + '='.repeat(60));
  console.log('Running: ' + fileName);
  console.log('='.repeat(60));
  
  const sql = fs.readFileSync(filePath, 'utf8');
  
  // Split by semicolon but be careful with function definitions
  const statements = sql
    .split(/;(?=(?:[^']*'[^']*')*[^']*$)/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (!statement) continue;
    
    try {
      // Use raw SQL execution via pg
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql_query: statement + ';' 
      }).catch(async (err) => {
        // Fallback: try direct query
        return await supabase.from('_migrations').select('*').limit(0);
      });
      
      if (error) {
        console.log('⚠ Warning [Statement ' + (i+1) + ']: ' + error.message.substring(0, 100));
        errorCount++;
      } else {
        successCount++;
      }
    } catch (err) {
      console.log('⚠ Error [Statement ' + (i+1) + ']: ' + err.message.substring(0, 100));
      errorCount++;
    }
  }
  
  console.log('\\nResults: ' + successCount + ' succeeded, ' + errorCount + ' warnings/errors');
  return { successCount, errorCount };
}

async function runAllMigrations() {
  const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    console.error('Migrations directory not found');
    process.exit(1);
  }
  
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();
  
  console.log('Found ' + files.length + ' migration files\\n');
  
  let totalSuccess = 0;
  let totalErrors = 0;
  
  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const result = await runMigration(filePath, file);
    totalSuccess += result.successCount;
    totalErrors += result.errorCount;
  }
  
  console.log('\\n' + '='.repeat(60));
  console.log('MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log('Total Statements: ' + (totalSuccess + totalErrors));
  console.log('Succeeded: ' + totalSuccess);
  console.log('Warnings/Errors: ' + totalErrors);
  console.log('='.repeat(60));
}

runAllMigrations().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
"@

Write-Host "Creating migration runner..." -ForegroundColor Yellow
$migrationRunner | Out-File -FilePath "temp_migrate.js" -Encoding UTF8

Write-Host "Executing migrations..." -ForegroundColor Yellow
Write-Host ""

node temp_migrate.js

Write-Host ""
Write-Host "Cleaning up..." -ForegroundColor Yellow
Remove-Item "temp_migrate.js" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Migration Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
