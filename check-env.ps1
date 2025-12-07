# Environment Configuration Checker

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Environment Configuration Checker" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path ".env.local")) {
    Write-Host "ERROR: .env.local not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Reading .env.local..." -ForegroundColor Yellow
$envVars = @{}
Get-Content ".env.local" | ForEach-Object {
    if ($_ -match "^([^=]+)=(.+)$") {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        $envVars[$key] = $value
    }
}

Write-Host ""
Write-Host "SUPABASE CONFIGURATION" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

if ($envVars.ContainsKey("NEXT_PUBLIC_SUPABASE_URL")) {
    Write-Host "[OK] Supabase URL: $($envVars['NEXT_PUBLIC_SUPABASE_URL'])" -ForegroundColor Green
} else {
    Write-Host "[MISSING] NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor Red
}

if ($envVars.ContainsKey("NEXT_PUBLIC_SUPABASE_ANON_KEY")) {
    $key = $envVars["NEXT_PUBLIC_SUPABASE_ANON_KEY"]
    Write-Host "[OK] Anon Key: $($key.Substring(0,20))..." -ForegroundColor Green
} else {
    Write-Host "[MISSING] NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Red
}

if ($envVars.ContainsKey("SUPABASE_SERVICE_ROLE_KEY")) {
    $key = $envVars["SUPABASE_SERVICE_ROLE_KEY"]
    Write-Host "[OK] Service Role Key: $($key.Substring(0,20))..." -ForegroundColor Green
} else {
    Write-Host "[MISSING] SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Red
}

Write-Host ""
Write-Host "DATABASE CONFIGURATION" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

if ($envVars.ContainsKey("DATABASE_URL")) {
    Write-Host "[OK] Database URL configured" -ForegroundColor Green
} else {
    Write-Host "[MISSING] DATABASE_URL" -ForegroundColor Red
}

Write-Host ""
Write-Host "R2 STORAGE CONFIGURATION" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

$r2Vars = @("R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME", "R2_PUBLIC_URL")
$r2Count = 0
foreach ($var in $r2Vars) {
    if ($envVars.ContainsKey($var)) {
        Write-Host "[OK] $var" -ForegroundColor Green
        $r2Count++
    } else {
        Write-Host "[MISSING] $var" -ForegroundColor Yellow
    }
}

if ($r2Count -eq 5) {
    Write-Host "R2 Storage: Fully configured" -ForegroundColor Green
} else {
    Write-Host "R2 Storage: Incomplete (optional)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "CONNECTION TEST" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

$testScript = @'
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('ERROR: Missing credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  try {
    const { data, error } = await supabase.from('cities').select('count').limit(1);
    if (error) throw error;
    console.log('SUCCESS: Database connected');
    
    const { count } = await supabase.from('cities').select('*', { count: 'exact', head: true });
    console.log('INFO: Cities in database: ' + (count || 0));
    
    process.exit(0);
  } catch (err) {
    console.log('ERROR: ' + err.message);
    process.exit(1);
  }
})();
'@

$testScript | Out-File -FilePath "temp_test.js" -Encoding UTF8
node temp_test.js
$testResult = $LASTEXITCODE
Remove-Item "temp_test.js" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$required = @("NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "DATABASE_URL")
$allPresent = $true
foreach ($var in $required) {
    if (-not $envVars.ContainsKey($var)) {
        $allPresent = $false
        break
    }
}

if ($allPresent -and $testResult -eq 0) {
    Write-Host "STATUS: Ready for development" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Run migrations: powershell -File migrate-db.ps1" -ForegroundColor White
    Write-Host "  2. Start dev server: npm run dev" -ForegroundColor White
} else {
    Write-Host "STATUS: Configuration incomplete" -ForegroundColor Yellow
    Write-Host "Please fix the errors above" -ForegroundColor Yellow
}

Write-Host ""
