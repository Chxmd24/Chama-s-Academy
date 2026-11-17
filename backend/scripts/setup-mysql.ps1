# ==============================================================================
# Chama's Academy - Secure MySQL Infrastructure Setup Script (Prompt 07B Final)
#
# Security & Design Principles:
# 1. Single Credential Source: Writes strictly to ONE Git-ignored local file:
#    backend/config/application-local.yml (Outside src/main/resources).
# 2. Universal Resolution: Loaded via classpath/file in application-mysql.yml,
#    functioning reliably whether Maven is executed from project root or backend/.
# 3. Zero CLI Argument / Log Exposure: SQL statements are streamed via STDIN.
#    Passwords are never passed via CLI arguments (-e / -p) or written to temp files.
# 4. Special Character Support: Robust escaping for quotes, backslashes, and symbols.
# 5. Principle of Least Privilege: Runtime user is restricted strictly to
#    (SELECT, INSERT, UPDATE, DELETE) on chamas_academy.*. No DDL, no global privileges.
# 6. Safe Preservation: Never overwrites existing databases or resets passwords
#    without explicit user consent.
# 7. Non-Destructive Environment Handling: Reports legacy Windows User environment
#    variables without deleting them automatically.
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
    # In MySQL strings: backslashes must be escaped as \\ and single quotes as ''
    return $val.Replace("\", "\\").Replace("'", "''")
}

function Escape-YamlDoubleQuoted([string]$val) {
    if ([string]::IsNullOrEmpty($val)) { return "" }
    # In YAML double-quoted scalars: backslashes must be escaped as \\ and double quotes as \"
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
Write-Host " Chama's Academy - Secure MySQL Infrastructure Setup" -ForegroundColor Cyan
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
# STEP 1: MySQL Administrator (root) Authentication
# ------------------------------------------------------------------------------
Write-Host "`nStep 1: MySQL Administrator (root) Authentication" -ForegroundColor Yellow
$rootSecure = Read-Host -Prompt "Enter MySQL root password" -AsSecureString
$rootPlain = Convert-ToPlainText $rootSecure

try {
    Write-Host "[*] Verifying root connection to localhost:3306 (via STDIN)..." -ForegroundColor Gray
    $testRes = Invoke-MySqlStdin -exePath $mysqlExe -user "root" -plainPassword $rootPlain -sql "SELECT VERSION();"
    if ($testRes.ExitCode -ne 0) {
        Write-Error "Failed to connect as root. MySQL error: $($testRes.Error)"
        exit 1
    }
    Write-Host "[+] Connected as root. MySQL Version: $($testRes.Output.Split("`n")[-1])" -ForegroundColor Green

    # --------------------------------------------------------------------------
    # STEP 2: Database Creation (Safe & Idempotent)
    # --------------------------------------------------------------------------
    Write-Host "`nStep 2: Checking Application Database ('chamas_academy')" -ForegroundColor Yellow
    $dbCheckSql = "SELECT COUNT(*) FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = 'chamas_academy';"
    $dbCheckRes = Invoke-MySqlStdin -exePath $mysqlExe -user "root" -plainPassword $rootPlain -sql $dbCheckSql
    $dbExists = ($dbCheckRes.Output.Split("`n")[-1].Trim() -eq "1")

    if ($dbExists) {
        Write-Host "[+] Database 'chamas_academy' already exists. Preserving database without modifications." -ForegroundColor Green
    } else {
        Write-Host "[*] Creating database 'chamas_academy' (utf8mb4 / utf8mb4_0900_ai_ci)..." -ForegroundColor Gray
        $createDbSql = "CREATE DATABASE chamas_academy CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;"
        $createDbRes = Invoke-MySqlStdin -exePath $mysqlExe -user "root" -plainPassword $rootPlain -sql $createDbSql
        if ($createDbRes.ExitCode -ne 0) {
            Write-Error "Failed to create database: $($createDbRes.Error)"
            exit 1
        }
        Write-Host "[+] Database 'chamas_academy' created successfully." -ForegroundColor Green
    }

    # --------------------------------------------------------------------------
    # STEP 3: Dedicated Application Account ('chamas_user'@'localhost')
    # --------------------------------------------------------------------------
    Write-Host "`nStep 3: Checking Dedicated Application Account ('chamas_user')" -ForegroundColor Yellow
    $userCheckSql = "SELECT COUNT(*) FROM mysql.user WHERE User = 'chamas_user' AND Host = 'localhost';"
    $userCheckRes = Invoke-MySqlStdin -exePath $mysqlExe -user "root" -plainPassword $rootPlain -sql $userCheckSql
    $userExists = ($userCheckRes.Output.Split("`n")[-1].Trim() -eq "1")

    $appPlain = ""
    $shouldUpdatePassword = $false

    if ($userExists) {
        Write-Host "[!] User 'chamas_user'@'localhost' already exists." -ForegroundColor Yellow
        $choice = Read-Host "Do you want to update its password in MySQL? (y/N)"
        if ($choice -match "^[yY]$") {
            $shouldUpdatePassword = $true
            $appSecure = Read-Host -Prompt "Enter NEW password for 'chamas_user'" -AsSecureString
            $appPlain = Convert-ToPlainText $appSecure
        } else {
            Write-Host "[*] Preserving existing password in MySQL." -ForegroundColor Gray
            $appSecure = Read-Host -Prompt "Enter CURRENT password for 'chamas_user' (to configure local application-local.yml)" -AsSecureString
            $appPlain = Convert-ToPlainText $appSecure
        }
    } else {
        $shouldUpdatePassword = $true
        Write-Host "[*] Creating new dedicated runtime user 'chamas_user'@'localhost'..." -ForegroundColor Gray
        $appSecure = Read-Host -Prompt "Enter password for dedicated user 'chamas_user'" -AsSecureString
        $appPlain = Convert-ToPlainText $appSecure
    }

    $escapedAppPassword = Escape-SqlString $appPlain

    # Apply User Creation / Password Update via STDIN (Never via CLI arguments)
    if ($userExists -and $shouldUpdatePassword) {
        Write-Host "[*] Updating password for existing 'chamas_user'@'localhost'..." -ForegroundColor Gray
        $alterSql = "ALTER USER 'chamas_user'@'localhost' IDENTIFIED BY '$escapedAppPassword';"
        $alterRes = Invoke-MySqlStdin -exePath $mysqlExe -user "root" -plainPassword $rootPlain -sql $alterSql
        if ($alterRes.ExitCode -ne 0) {
            Write-Error "Failed to update user password: $($alterRes.Error)"
            exit 1
        }
    } elseif (-not $userExists) {
        $createUserSql = "CREATE USER 'chamas_user'@'localhost' IDENTIFIED BY '$escapedAppPassword';"
        $createRes = Invoke-MySqlStdin -exePath $mysqlExe -user "root" -plainPassword $rootPlain -sql $createUserSql
        if ($createRes.ExitCode -ne 0) {
            Write-Error "Failed to create application user: $($createRes.Error)"
            exit 1
        }
    }

    # --------------------------------------------------------------------------
    # STEP 4: Privilege Restriction (Least Privilege Principle)
    # --------------------------------------------------------------------------
    # Restrict strictly to DML (SELECT, INSERT, UPDATE, DELETE).
    # Explicitly exclude DDL (CREATE, ALTER, DROP) and administrative privileges.
    Write-Host "[*] Restricting privileges strictly to DML (SELECT, INSERT, UPDATE, DELETE) on 'chamas_academy.*'..." -ForegroundColor Gray
    $grantSql = @"
REVOKE ALL PRIVILEGES, GRANT OPTION FROM 'chamas_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON chamas_academy.* TO 'chamas_user'@'localhost';
FLUSH PRIVILEGES;
"@
    $grantRes = Invoke-MySqlStdin -exePath $mysqlExe -user "root" -plainPassword $rootPlain -sql $grantSql
    if ($grantRes.ExitCode -ne 0) {
        Write-Error "Failed to configure privileges: $($grantRes.Error)"
        exit 1
    }
    Write-Host "[+] Privileges strictly limited to SELECT, INSERT, UPDATE, DELETE on 'chamas_academy.*'." -ForegroundColor Green

    # --------------------------------------------------------------------------
    # STEP 5: Verification of Application Account Access & Isolation
    # --------------------------------------------------------------------------
    Write-Host "`nStep 5: Verifying Application Account Access & Isolation" -ForegroundColor Yellow
    $appTestRes = Invoke-MySqlStdin -exePath $mysqlExe -user "chamas_user" -plainPassword $appPlain -sql "SELECT DATABASE(), USER();" -database "chamas_academy"
    if ($appTestRes.ExitCode -eq 0) {
        Write-Host "[+] Application user verified: Successfully connected to 'chamas_academy'." -ForegroundColor Green
    } else {
        Write-Error "Application user failed to connect: $($appTestRes.Error)"
        exit 1
    }

    # Verify that DDL operations (CREATE TABLE) are blocked
    $ddlTestSql = "CREATE TABLE chamas_test_forbidden (id INT);"
    $ddlTestRes = Invoke-MySqlStdin -exePath $mysqlExe -user "chamas_user" -plainPassword $appPlain -sql $ddlTestSql -database "chamas_academy"
    if ($ddlTestRes.ExitCode -ne 0) {
        Write-Host "[+] Security verified: DDL operations (CREATE TABLE) are correctly denied to runtime user." -ForegroundColor Green
    } else {
        Write-Warning "DDL was not blocked! Cleaning up test table..."
        Invoke-MySqlStdin -exePath $mysqlExe -user "root" -plainPassword $rootPlain -sql "DROP TABLE IF EXISTS chamas_academy.chamas_test_forbidden;" | Out-Null
    }

    # Verify that unrelated databases (e.g. mysql) are inaccessible
    $isolationRes = Invoke-MySqlStdin -exePath $mysqlExe -user "chamas_user" -plainPassword $appPlain -sql "SHOW TABLES;" -database "mysql"
    if ($isolationRes.ExitCode -ne 0) {
        Write-Host "[+] Isolation verified: Access to unrelated database 'mysql' is correctly denied." -ForegroundColor Green
    } else {
        Write-Warning "User unexpectedly had access to mysql schema. Please check privileges."
    }

    # --------------------------------------------------------------------------
    # STEP 6: Check Windows User Environment Variables (Non-Destructive)
    # --------------------------------------------------------------------------
    Write-Host "`nStep 6: Checking Windows User Environment Variables" -ForegroundColor Yellow
    $userVars = [System.Environment]::GetEnvironmentVariables("User")
    $legacyVars = @()
    foreach ($varName in @("SPRING_DATASOURCE_PASSWORD", "SPRING_DATASOURCE_USERNAME", "SPRING_DATASOURCE_URL", "MYSQL_PWD")) {
        if ($userVars.ContainsKey($varName)) {
            $legacyVars += $varName
        }
    }
    if ($legacyVars.Count -gt 0) {
        Write-Host "[!] Found existing Windows User environment variable(s): $($legacyVars -join ', ')" -ForegroundColor Yellow
        $removeAns = Read-Host "Would you like to remove these legacy Windows User variables? (y/N)"
        if ($removeAns -match "^[yY]$") {
            foreach ($varName in $legacyVars) {
                [System.Environment]::SetEnvironmentVariable($varName, $null, "User")
                Write-Host "    [-] Removed $varName from Windows User environment." -ForegroundColor Gray
            }
        } else {
            Write-Host "    [*] Preserved existing Windows User environment variables unchanged." -ForegroundColor Gray
        }
    } else {
        Write-Host "[+] Confirmed: No legacy Windows User environment variables present." -ForegroundColor Green
    }

    # --------------------------------------------------------------------------
    # STEP 7: Write Single Git-Ignored Local Configuration File (Outside src/main/resources)
    # --------------------------------------------------------------------------
    Write-Host "`nStep 7: Writing Single Local Credentials File" -ForegroundColor Yellow
    $backendDir = Split-Path -Parent $PSScriptRoot
    $configDir = Join-Path $backendDir "config"
    if (-not (Test-Path $configDir)) {
        New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    }
    $localYmlPath = Join-Path $configDir "application-local.yml"
    $dbUrl = "jdbc:mysql://localhost:3306/chamas_academy?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"

    # Escape password for YAML double-quoted scalar
    $yamlEscapedPassword = Escape-YamlDoubleQuoted $appPlain

    $localYmlContent = @"
# ===================================================================
# Chama's Academy - Local Development Credentials (GIT-IGNORED)
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# ===================================================================
spring:
  datasource:
    url: $dbUrl
    username: chamas_user
    password: "$yamlEscapedPassword"
"@
    Set-Content -Path $localYmlPath -Value $localYmlContent -Encoding UTF8 -Force
    Write-Host "[+] Saved local configuration to: $localYmlPath" -ForegroundColor Green

    # Set Windows File ACLs: current user only
    try {
        $acl = Get-Acl $localYmlPath
        $acl.SetAccessRuleProtection($true, $false)
        $rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
            $env:USERNAME, "FullControl", "Allow"
        )
        $acl.SetAccessRule($rule)
        Set-Acl -Path $localYmlPath -AclObject $acl
        Write-Host "[+] Restricted file permissions: Accessible only by user '$env:USERNAME'." -ForegroundColor Green
    } catch {
        Write-Host "[i] File created (ACL adjustment skipped: $($_.Exception.Message))" -ForegroundColor Gray
    }

    Write-Host "`n[✓] MySQL Database & User Setup Completed Successfully!" -ForegroundColor Cyan
    Write-Host "You can now run the backend with the mysql profile from root or backend directory:" -ForegroundColor Gray
    Write-Host "  mvn spring-boot:run -Dspring-boot.run.profiles=mysql -f backend/pom.xml" -ForegroundColor White

} finally {
    # Securely wipe in-memory credentials
    $rootPlain = $null
    $appPlain = $null
    $escapedAppPassword = $null
    $env:MYSQL_PWD = $null
    [System.GC]::Collect()
}
