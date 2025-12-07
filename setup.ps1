# Home Solution Platform - Complete Setup Script
# PowerShell Script for Windows

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Home Solution Platform - Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if command exists
function Test-Command {
    param($Command)
    try {
        if (Get-Command $Command -ErrorAction Stop) {
            return $true
        }
    }
    catch {
        return $false
    }
}

# 1. Check Node.js
Write-Host "[1/8] Checking Node.js..." -ForegroundColor Yellow
if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js not found. Please install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# 2. Check npm
Write-Host "[2/8] Checking npm..." -ForegroundColor Yellow
if (Test-Command "npm") {
    $npmVersion = npm --version
    Write-Host "✓ npm installed: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "✗ npm not found" -ForegroundColor Red
    exit 1
}

# 3. Check .env.local
Write-Host "[3/8] Checking environment variables..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "✓ .env.local found" -ForegroundColor Green
    
    # Read and validate env variables
    $envContent = Get-Content ".env.local" -Raw
    
    $requiredVars = @(
        "SUPABASE_SERVICE_ROLE_KEY",
        "DATABASE_URL",
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    )
    
    $missingVars = @()
    foreach ($var in $requiredVars) {
        if ($envContent -notmatch "$var=") {
            $missingVars += $var
        }
    }
    
    if ($missingVars.Count -gt 0) {
        Write-Host "✗ Missing environment variables:" -ForegroundColor Red
        $missingVars | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    } else {
        Write-Host "✓ All required environment variables present" -ForegroundColor Green
    }
    
    # Display current configuration
    Write-Host "`nCurrent Configuration:" -ForegroundColor Cyan
    if ($envContent -match "NEXT_PUBLIC_SUPABASE_URL=(.+)") {
        Write-Host "  Supabase URL: $($matches[1])" -ForegroundColor White
    }
    if ($envContent -match "DATABASE_URL=(.+)") {
        $dbUrl = $matches[1]
        if ($dbUrl -match "@(.+?):") {
            Write-Host "  Database Host: $($matches[1])" -ForegroundColor White
        }
    }
    
} else {
    Write-Host "✗ .env.local not found" -ForegroundColor Red
    Write-Host "  Creating from template..." -ForegroundColor Yellow
    if (Test-Path ".env.local.template") {
        Copy-Item ".env.local.template" ".env.local"
        Write-Host "  Please edit .env.local with your credentials" -ForegroundColor Yellow
    }
}

# 4. Install dependencies
Write-Host "`n[4/8] Installing dependencies..." -ForegroundColor Yellow
Write-Host "Running: npm install" -ForegroundColor Gray
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# 5. Check database connection
Write-Host "`n[5/8] Testing database connection..." -ForegroundColor Yellow
$testScript = @"
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('ERROR: Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) throw error;
    console.log('SUCCESS: Database connection established');
    process.exit(0);
  } catch (err) {
    console.log('ERROR: ' + err.message);
    process.exit(1);
  }
})();
"@

$testScript | Out-File -FilePath "temp_test.js" -Encoding UTF8
node temp_test.js
$dbTestResult = $LASTEXITCODE
Remove-Item "temp_test.js" -ErrorAction SilentlyContinue

if ($dbTestResult -eq 0) {
    Write-Host "✓ Database connection successful" -ForegroundColor Green
} else {
    Write-Host "✗ Database connection failed" -ForegroundColor Red
    Write-Host "  Please check your DATABASE_URL and credentials" -ForegroundColor Yellow
}

# 6. List migration files
Write-Host "`n[6/8] Checking migration files..." -ForegroundColor Yellow
if (Test-Path "supabase\migrations") {
    $migrations = Get-ChildItem "supabase\migrations\*.sql" | Sort-Object Name
    Write-Host "✓ Found $($migrations.Count) migration files:" -ForegroundColor Green
    $migrations | ForEach-Object { Write-Host "  - $($_.Name)" -ForegroundColor Gray }
} else {
    Write-Host "✗ Migration directory not found" -ForegroundColor Red
}

# 7. Run migrations
Write-Host "`n[7/8] Running database migrations..." -ForegroundColor Yellow
Write-Host "Do you want to run migrations? (Y/N): " -ForegroundColor Cyan -NoNewline
$runMigrations = Read-Host

if ($runMigrations -eq "Y" -or $runMigrations -eq "y") {
    $migrationScript = @"
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log('Running migrations...');
  
  for (const file of files) {
    console.log('Executing: ' + file);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
      if (error) {
        console.log('Warning: ' + file + ' - ' + error.message);
      } else {
        console.log('Success: ' + file);
      }
    } catch (err) {
      console.log('Error: ' + file + ' - ' + err.message);
    }
  }
  
  console.log('Migrations completed');
}

runMigrations();
"@
    
    $migrationScript | Out-File -FilePath "run_migrations.js" -Encoding UTF8
    node run_migrations.js
    Remove-Item "run_migrations.js" -ErrorAction SilentlyContinue
    
    Write-Host "✓ Migrations executed" -ForegroundColor Green
} else {
    Write-Host "⊘ Skipped migrations" -ForegroundColor Yellow
}

# 8. Build check
Write-Host "`n[8/8] Checking build configuration..." -ForegroundColor Yellow
if (Test-Path "next.config.js") {
    Write-Host "✓ next.config.js found" -ForegroundColor Green
}
if (Test-Path "tailwind.config.js") {
    Write-Host "✓ tailwind.config.js found" -ForegroundColor Green
}
if (Test-Path "package.json") {
    Write-Host "✓ package.json found" -ForegroundColor Green
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Setup Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Project: Home Solution Platform" -ForegroundColor White
Write-Host "Status: Ready for development" -ForegroundColor Green
Write-Host ""
Write-Host "Available Commands:" -ForegroundColor Cyan
Write-Host "  npm run dev     - Start development server" -ForegroundColor White
Write-Host "  npm run build   - Build for production" -ForegroundColor White
Write-Host "  npm run start   - Start production server" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Run: npm run dev" -ForegroundColor White
Write-Host "  2. Open: http://localhost:3000" -ForegroundColor White
Write-Host "  3. Check admin panel: http://localhost:3000/admin/dashboard" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
