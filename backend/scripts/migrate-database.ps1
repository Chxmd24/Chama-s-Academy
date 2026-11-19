# ==============================================================================
# Chama's Academy - Explicit Flyway Database Migration Runner
#
# Safety Principles:
# 1. Explicit Opt-In: Never runs automatically during ordinary backend startup.
# 2. Dedicated Account: Runs strictly as chamas_migrator (DDL/DML scoped).
# 3. Target Verification: Refuses to run against unexpected or non-empty schemas.
# 4. Zero Secret Exposure: Uses process environment variables for Flyway authentication;
#    passwords never appear in command-line arguments or log files.
# 5. Non-Destructive Error Handling: Never drops tables or runs repair automatically on failure.
# ==============================================================================

[CmdletBinding()]
param(
    [switch]$Force
)

$ErrorActionPreference = "Stop"

function Convert-ToPlainText([System.Security.SecureString]$secureStr) {
    if ($null -eq $secureStr) { return "" }
    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureStr)
    try {
        return [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
    } finally {
        [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    }
}

function Unescape-YamlDoubleQuoted([string]$val) {
    if ([string]::IsNullOrEmpty($val)) { return "" }
    # Unescape \" -> " and \\ -> \
    return $val.Replace('\"', '"').Replace('\\', '\')
}

function Invoke-MySqlStdin([string]$exePath, [string]$user, [string]$plainPassword, [string]$sql, [string]$database = "chamas_academy") {
    $env:MYSQL_PWD = $plainPassword
    try {
        $pinfo = New-Object System.Diagnostics.ProcessStartInfo
        $pinfo.FileName = $exePath
        $pinfo.Arguments = "--default-character-set=utf8mb4 -u $user $database"
        $pinfo.RedirectStandardInput = $true
        $pinfo.RedirectStandardOutput = $true
        $pinfo.RedirectStandardError = $true
        $pinfo.UseShellExecute = $false
        $pinfo.CreateNoWindow = $true

        $process = [System.Diagnostics.Process]::Start($pinfo)
        $sw = $process.StandardInput
        $sw.WriteLine($sql)
        $sw.Close()

        $stdout = $process.StandardOutput.ReadToEnd()
        $stderr = $process.StandardError.ReadToEnd()
        $process.WaitForExit()

        return [PSCustomObject]@{
            ExitCode = $process.ExitCode
            Output   = $stdout.Trim()
            Error    = $stderr.Trim()
        }
    } finally {
        $env:MYSQL_PWD = $null
    }
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Chama's Academy - Controlled Database Migration Runner" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Locate mysql.exe
$mysqlExe = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
if (-not (Test-Path $mysqlExe)) {
    $cmd = Get-Command mysql.exe -ErrorAction SilentlyContinue
    if ($cmd) {
        $mysqlExe = $cmd.Source
    } else {
        Write-Error "mysql.exe could not be found. Please ensure MySQL Server 8.0 is installed."
        exit 1
    }
}

# ------------------------------------------------------------------------------
# STEP 1: Load Migrator Credentials
# ------------------------------------------------------------------------------
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Split-Path -Parent $scriptDir
$flywayConfigPath = Join-Path (Join-Path $backendDir "config") "flyway-local.yml"

$migratorUser = "chamas_migrator"
$migratorPlainPwd = ""

if (Test-Path $flywayConfigPath) {
    Write-Host "[+] Found local migration configuration at: $flywayConfigPath" -ForegroundColor Green
    $lines = Get-Content $flywayConfigPath
    foreach ($l in $lines) {
        $trimmed = $l.Trim()
        if ($trimmed.StartsWith("user:")) {
            $migratorUser = $trimmed.Substring("user:".Length).Trim().Trim('"')
        }
        if ($trimmed.StartsWith("password:")) {
            $rawVal = $trimmed.Substring("password:".Length).Trim()
            if ($rawVal.StartsWith('"') -and $rawVal.EndsWith('"')) {
                $rawVal = $rawVal.Substring(1, $rawVal.Length - 2)
            }
            $migratorPlainPwd = Unescape-YamlDoubleQuoted $rawVal
        }
    }
}

if ([string]::IsNullOrWhiteSpace($migratorPlainPwd)) {
    Write-Host "[!] No saved credentials found for 'chamas_migrator'." -ForegroundColor Yellow
    $sec = Read-Host "Enter password for '$migratorUser'" -AsSecureString
    $migratorPlainPwd = Convert-ToPlainText $sec
}

# ------------------------------------------------------------------------------
# STEP 2: Pre-Migration Target Verification
# ------------------------------------------------------------------------------
Write-Host "`n[Step 1] Verifying target database 'chamas_academy'..." -ForegroundColor Yellow

$checkTarget = Invoke-MySqlStdin -exePath $mysqlExe -user $migratorUser -plainPassword $migratorPlainPwd -sql "SELECT DATABASE();"
if ($checkTarget.ExitCode -ne 0) {
    Write-Error "Pre-migration check failed: Cannot authenticate as '$migratorUser'. Ensure setup-migrator.ps1 has been run."
    $migratorPlainPwd = $null
    exit 1
}
if ($checkTarget.Output -notmatch "chamas_academy") {
    Write-Error "Target database verification failed: Current schema is '$($checkTarget.Output)', expected 'chamas_academy'."
    $migratorPlainPwd = $null
    exit 1
}
Write-Host "[+] Connected to target schema: chamas_academy" -ForegroundColor Green

# ------------------------------------------------------------------------------
# STEP 3: Schema Inspection & Safety Check
# ------------------------------------------------------------------------------
Write-Host "`n[Step 2] Inspecting existing schema state..." -ForegroundColor Yellow

$tablesCheck = Invoke-MySqlStdin -exePath $mysqlExe -user $migratorUser -plainPassword $migratorPlainPwd -sql "SHOW TABLES;"
$tableList = if ($tablesCheck.Output) { $tablesCheck.Output -split "\r?\n" } else { @() }

$hasFlywayHistory = ($tableList -contains "flyway_schema_history")
$nonFlywayTables = $tableList | Where-Object { $_ -ne "flyway_schema_history" -and $_ -ne "Tables_in_chamas_academy" -and -not [string]::IsNullOrWhiteSpace($_) }

if ($nonFlywayTables.Count -gt 0 -and -not $hasFlywayHistory) {
    Write-Error "Safety violation: Target schema contains $($nonFlywayTables.Count) existing tables but has no Flyway history. Migration aborted to prevent unintended modifications. Please inspect schema manually."
    $migratorPlainPwd = $null
    exit 1
}

if ($tableList.Count -eq 0 -or ($tableList.Count -eq 1 -and $tableList[0] -eq "Tables_in_chamas_academy")) {
    Write-Host "[+] Target database is completely empty (clean baseline)." -ForegroundColor Green
} else {
    Write-Host "[*] Target database currently contains $($nonFlywayTables.Count) managed tables." -ForegroundColor Cyan
}

# ------------------------------------------------------------------------------
# STEP 4: User Confirmation
# ------------------------------------------------------------------------------
if (-not $Force) {
    Write-Host "`n----------------------------------------------------------" -ForegroundColor Yellow
    Write-Host " TARGET:    localhost:3306 / chamas_academy" -ForegroundColor Yellow
    Write-Host " USER:      $migratorUser" -ForegroundColor Yellow
    Write-Host " ACTION:    Execute pending Flyway migrations (V1, V2)" -ForegroundColor Yellow
    Write-Host "----------------------------------------------------------" -ForegroundColor Yellow
    $confirm = Read-Host "Proceed with database migration? (y/N)"
    if ($confirm -notmatch "^[Yy]$") {
        Write-Host "Migration cancelled by user." -ForegroundColor Yellow
        $migratorPlainPwd = $null
        exit 0
    }
}

# ------------------------------------------------------------------------------
# STEP 5: Execute Flyway Migration via Maven
# ------------------------------------------------------------------------------
Write-Host "`n[Step 3] Executing Flyway migration via Maven plugin..." -ForegroundColor Yellow

try {
    $env:FLYWAY_URL = "jdbc:mysql://localhost:3306/chamas_academy?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
    $env:FLYWAY_USER = $migratorUser
    $env:FLYWAY_PASSWORD = $migratorPlainPwd

    try {
        $pomPath = Join-Path $backendDir "pom.xml"
        & mvn flyway:migrate -f $pomPath
        $mvnExit = $LASTEXITCODE

        if ($mvnExit -ne 0) {
            Write-Error "Flyway migration failed with Maven exit code $mvnExit. Inspect logs above. DO NOT run flyway:repair without manual schema review."
            exit $mvnExit
        }
    } finally {
        # Clear environment credentials immediately after Maven returns
        $env:FLYWAY_URL = $null
        $env:FLYWAY_USER = $null
        $env:FLYWAY_PASSWORD = $null
    }

    # ------------------------------------------------------------------------------
    # STEP 6: Post-Migration Verification
    # ------------------------------------------------------------------------------
    Write-Host "`n[Step 4] Verifying applied migrations and schema state..." -ForegroundColor Yellow

    $historyCheck = Invoke-MySqlStdin -exePath $mysqlExe -user $migratorUser -plainPassword $migratorPlainPwd -sql "SELECT installed_rank, version, description, type, execution_time, success FROM chamas_academy.flyway_schema_history ORDER BY installed_rank;"

    Write-Host "`nFlyway Schema History:" -ForegroundColor Green
    Write-Output $historyCheck.Output

    $newTablesCheck = Invoke-MySqlStdin -exePath $mysqlExe -user $migratorUser -plainPassword $migratorPlainPwd -sql "SHOW TABLES;"
    Write-Host "`nCurrent Tables in chamas_academy:" -ForegroundColor Green
    Write-Output $newTablesCheck.Output

    Write-Host "`n==========================================================" -ForegroundColor Green
    Write-Host " Migration Completed Successfully!" -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
} finally {
    # Ensure secret is wiped from script memory
    $migratorPlainPwd = $null
}
