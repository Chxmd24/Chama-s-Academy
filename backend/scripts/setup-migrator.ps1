# ==============================================================================
# Chama's Academy - Secure Flyway Migration Account Setup Script
# Creates dedicated DDL/DML migration account: chamas_migrator@localhost
#
# Security & Design Principles:
# 1. Zero CLI Argument / Log Exposure: SQL statements are streamed via STDIN.
#    Passwords are never passed via CLI arguments (-e / -p) or written to logs.
# 2. Scoped Privileges: Restricted strictly to chamas_academy.*
#    (CREATE, ALTER, DROP, INDEX, REFERENCES, SELECT, INSERT, UPDATE, DELETE).
#    Zero global administrative permissions (no SUPER, SHUTDOWN, GRANT OPTION).
# 3. Safe Preservation: Checks if chamas_migrator already exists and asks before
#    resetting password. Never modifies chamas_user privileges.
# 4. Separate Credential Storage: Stores migrator credentials in a dedicated,
#    Git-ignored file: backend/config/flyway-local.yml (outside src/main/resources).
# ==============================================================================

[CmdletBinding()]
param()

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

function Escape-SqlString([string]$val) {
    if ([string]::IsNullOrEmpty($val)) { return "" }
    return $val.Replace("\", "\\").Replace("'", "''")
}

function Escape-YamlDoubleQuoted([string]$val) {
    if ([string]::IsNullOrEmpty($val)) { return "" }
    return $val.Replace("\", "\\").Replace('"', '\"')
}

function Invoke-MySqlStdin([string]$exePath, [string]$user, [string]$plainPassword, [string]$sql, [string]$database = "") {
    $env:MYSQL_PWD = $plainPassword
    try {
        $pinfo = New-Object System.Diagnostics.ProcessStartInfo
        $pinfo.FileName = $exePath
        if ([string]::IsNullOrEmpty($database)) {
            $pinfo.Arguments = "--default-character-set=utf8mb4 -u $user"
        } else {
            $pinfo.Arguments = "--default-character-set=utf8mb4 -u $user $database"
        }
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
Write-Host " Chama's Academy - Flyway Migration Account Setup" -ForegroundColor Cyan
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
Write-Host "[+] Found MySQL CLI at: $mysqlExe" -ForegroundColor Green

# ------------------------------------------------------------------------------
# STEP 1: MySQL Administrator Authentication
# ------------------------------------------------------------------------------
Write-Host "`n[Step 1] MySQL Administrator Authentication" -ForegroundColor Yellow
$rootUser = Read-Host "Enter MySQL admin username [default: root]"
if ([string]::IsNullOrWhiteSpace($rootUser)) { $rootUser = "root" }

$rootSecurePwd = Read-Host "Enter password for MySQL admin '$rootUser'" -AsSecureString
$rootPlainPwd = Convert-ToPlainText $rootSecurePwd

$verifyRes = Invoke-MySqlStdin -exePath $mysqlExe -user $rootUser -plainPassword $rootPlainPwd -sql "SELECT VERSION();"
if ($verifyRes.ExitCode -ne 0) {
    Write-Error "Failed to authenticate as '$rootUser'. Please verify credentials and MySQL server status."
    $rootPlainPwd = $null
    exit 1
}
Write-Host "[+] Connected to MySQL successfully." -ForegroundColor Green

# ------------------------------------------------------------------------------
# STEP 2: Verify chamas_academy Database Exists
# ------------------------------------------------------------------------------
Write-Host "`n[Step 2] Verifying target database 'chamas_academy'..." -ForegroundColor Yellow
$dbCheck = Invoke-MySqlStdin -exePath $mysqlExe -user $rootUser -plainPassword $rootPlainPwd -sql "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = 'chamas_academy';"
if ($dbCheck.Output -notmatch "chamas_academy") {
    Write-Error "Database 'chamas_academy' does not exist. Please run setup-mysql.ps1 first."
    $rootPlainPwd = $null
    exit 1
}
Write-Host "[+] Target database 'chamas_academy' verified." -ForegroundColor Green

# ------------------------------------------------------------------------------
# STEP 3: Create or Verify chamas_migrator Account
# ------------------------------------------------------------------------------
Write-Host "`n[Step 3] Configuring dedicated Flyway account 'chamas_migrator@localhost'..." -ForegroundColor Yellow

$userCheck = Invoke-MySqlStdin -exePath $mysqlExe -user $rootUser -plainPassword $rootPlainPwd -sql "SELECT User FROM mysql.user WHERE User = 'chamas_migrator' AND Host = 'localhost';"
$migratorExists = ($userCheck.Output -match "chamas_migrator")

$migratorPlainPwd = ""

if ($migratorExists) {
    Write-Host "[!] Account 'chamas_migrator'@'localhost' already exists in MySQL." -ForegroundColor Yellow
    Write-Host "[!] Stopping execution without changing its password or privileges, as required by safety protocol." -ForegroundColor Yellow
    $rootPlainPwd = $null
    exit 0
}

while ($true) {
    $pwd1 = Read-Host "Enter a STRONG password for 'chamas_migrator' (min 12 chars)" -AsSecureString
    $pwd2 = Read-Host "Confirm password for 'chamas_migrator'" -AsSecureString
    $plain1 = Convert-ToPlainText $pwd1
    $plain2 = Convert-ToPlainText $pwd2

    if ([string]::IsNullOrWhiteSpace($plain1) -or $plain1.Length -lt 12) {
        Write-Host "[!] Password must be at least 12 characters long." -ForegroundColor Red
        continue
    }
    if ($plain1 -ne $plain2) {
        Write-Host "[!] Passwords do not match. Please try again." -ForegroundColor Red
        continue
    }
    $migratorPlainPwd = $plain1
    $plain1 = $null; $plain2 = $null
    break
}

$escapedSqlPwd = Escape-SqlString $migratorPlainPwd
$sqlUser = "CREATE USER 'chamas_migrator'@'localhost' IDENTIFIED BY '$escapedSqlPwd';"

$resUser = Invoke-MySqlStdin -exePath $mysqlExe -user $rootUser -plainPassword $rootPlainPwd -sql $sqlUser
if ($resUser.ExitCode -ne 0) {
    Write-Error "Failed to create 'chamas_migrator': $($resUser.Error)"
    $rootPlainPwd = $null; $migratorPlainPwd = $null
    exit 1
}
Write-Host "[+] Account 'chamas_migrator'@'localhost' created." -ForegroundColor Green

# ------------------------------------------------------------------------------
# STEP 4: Apply Scoped DDL + DML Privileges (Strictly chamas_academy.*)
# ------------------------------------------------------------------------------
Write-Host "`n[Step 4] Granting scoped DDL/DML privileges on chamas_academy.*..." -ForegroundColor Yellow

$grantSql = @"
REVOKE ALL PRIVILEGES, GRANT OPTION FROM 'chamas_migrator'@'localhost';
GRANT CREATE, ALTER, DROP, INDEX, REFERENCES, SELECT, INSERT, UPDATE, DELETE ON chamas_academy.* TO 'chamas_migrator'@'localhost';
FLUSH PRIVILEGES;
"@

$grantRes = Invoke-MySqlStdin -exePath $mysqlExe -user $rootUser -plainPassword $rootPlainPwd -sql $grantSql
if ($grantRes.ExitCode -ne 0) {
    Write-Error "Failed to grant privileges: $($grantRes.Error)"
    $rootPlainPwd = $null; $migratorPlainPwd = $null
    exit 1
}
Write-Host "[+] Privileges granted strictly on chamas_academy.* (Zero global privileges)." -ForegroundColor Green

# Clear root password from memory immediately
$rootPlainPwd = $null

# ------------------------------------------------------------------------------
# STEP 5: Verify Isolation & Connectivity
# ------------------------------------------------------------------------------
Write-Host "`n[Step 5] Verifying chamas_migrator connectivity and database isolation..." -ForegroundColor Yellow

$testConn = Invoke-MySqlStdin -exePath $mysqlExe -user "chamas_migrator" -plainPassword $migratorPlainPwd -sql "SELECT DATABASE();" -database "chamas_academy"
if ($testConn.ExitCode -ne 0) {
    Write-Error "Verification failed: 'chamas_migrator' could not connect to 'chamas_academy'."
    $migratorPlainPwd = $null
    exit 1
}
Write-Host "[+] Verified: chamas_migrator connects successfully to chamas_academy." -ForegroundColor Green

$isoTest = Invoke-MySqlStdin -exePath $mysqlExe -user "chamas_migrator" -plainPassword $migratorPlainPwd -sql "SELECT User FROM mysql.user LIMIT 1;" -database "chamas_academy"
if ($isoTest.ExitCode -eq 0) {
    Write-Warning "Security alert: chamas_migrator was able to query mysql.user! Check global grants."
} else {
    Write-Host "[+] Verified: Access to unrelated system database 'mysql' is DENIED." -ForegroundColor Green
}

# ------------------------------------------------------------------------------
# STEP 6: Store Migrator Credentials in Git-Ignored Config File
# ------------------------------------------------------------------------------
Write-Host "`n[Step 6] Writing migrator credentials to Git-ignored backend/config/flyway-local.yml..." -ForegroundColor Yellow

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Split-Path -Parent $scriptDir
$configDir = Join-Path $backendDir "config"
if (-not (Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
}

$flywayConfigPath = Join-Path $configDir "flyway-local.yml"
$yamlEscapedPwd = Escape-YamlDoubleQuoted $migratorPlainPwd

$yamlContent = @"
# ==============================================================================
# Chama's Academy - Local Flyway Migration Credentials (GIT-IGNORED)
# NEVER commit this file or package it inside the executable JAR.
# ==============================================================================
flyway:
  url: "jdbc:mysql://localhost:3306/chamas_academy?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
  user: "chamas_migrator"
  password: "$yamlEscapedPwd"
"@

Set-Content -Path $flywayConfigPath -Value $yamlContent -Encoding UTF8 -Force

# Restrict file ACL permissions to current user only
try {
    $acl = Get-Acl $flywayConfigPath
    $acl.SetAccessRuleProtection($true, $false)
    $identity = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
    $rule = New-Object System.Security.AccessControl.FileSystemAccessRule($identity, "FullControl", "Allow")
    $acl.SetAccessRule($rule)
    Set-Acl -Path $flywayConfigPath -AclObject $acl
    Write-Host "[+] Applied restricted user-only file permissions on flyway-local.yml." -ForegroundColor Green
} catch {
    Write-Warning "Could not modify file ACLs on flyway-local.yml: $($_.Exception.Message)"
}

# Clear secrets from memory
$migratorPlainPwd = $null
$yamlEscapedPwd = $null

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host " chamas_migrator Setup Complete!" -ForegroundColor Green
Write-Host " - Account: chamas_migrator@localhost" -ForegroundColor Green
Write-Host " - Scope:   chamas_academy.* (DDL + DML only)" -ForegroundColor Green
Write-Host " - Config:  backend/config/flyway-local.yml (Git-ignored)" -ForegroundColor Green
Write-Host " - Runtime: chamas_user privileges remain untouched." -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
