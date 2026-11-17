# Chama's Academy - MySQL Database Infrastructure Setup

## 1. Overview
This document specifies the database infrastructure configuration for Chama's Academy (Indoor Cricket & Football Stadium Management System).

- **Database Engine:** MySQL Server 8.0.46
- **Database Name:** `chamas_academy`
- **Character Set:** `utf8mb4`
- **Collation:** `utf8mb4_0900_ai_ci`
- **Application User:** `chamas_user` (restricted strictly to `chamas_academy.*`)
- **Host:** `localhost:3306`

---

## 2. Least Privilege Security Model

The runtime web application account (`chamas_user`) is strictly restricted to Data Manipulation Language (DML) privileges. It has **no** DDL (Data Definition Language) or administrative rights:

```sql
-- 1. Create Application Database (Safe idempotent creation)
CREATE DATABASE IF NOT EXISTS chamas_academy
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

-- 2. Create Dedicated Application Account (Do not use root)
CREATE USER IF NOT EXISTS 'chamas_user'@'localhost' IDENTIFIED BY '<STRONG_PASSWORD>';

-- 3. Restrict Application Privileges strictly to DML (SELECT, INSERT, UPDATE, DELETE)
-- Explicitly NO DROP, CREATE, ALTER, INDEX, or REFERENCES
REVOKE ALL PRIVILEGES, GRANT OPTION FROM 'chamas_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON chamas_academy.* TO 'chamas_user'@'localhost';

-- 4. Apply Privileges
FLUSH PRIVILEGES;
```

> **Note:** Schema migrations will be handled separately in future milestones using a dedicated, privileged migration mechanism (such as Liquibase/Flyway). The runtime application cannot create, alter, or drop tables.

---

## 3. Single Git-Ignored Credential Storage

Credentials are **never** committed to Git and are **never** stored in Windows User Registry environment variables.

To prevent password duplication across files, there is **only ONE** local credentials file:
- `backend/config/application-local.yml` (Outside `src/main/resources`, strictly excluded by `.gitignore`)

### Universal Resolution in Spring Boot
In `backend/src/main/resources/application-mysql.yml`, Spring Boot imports this file via:
```yaml
spring:
  config:
    activate:
      on-profile: mysql
    import:
      - "optional:file:./config/application-local.yml"
      - "optional:file:./backend/config/application-local.yml"
      - "optional:file:../config/application-local.yml"
```
Because of `optional:classpath:application-local.yml`, Spring Boot loads the configuration reliably regardless of whether Maven is started from the repository root (`mvn spring-boot:run -f backend/pom.xml`) or from the `backend/` directory (`mvn spring-boot:run`).

---

## 4. Local Execution Options

### Option A: Automated PowerShell Setup (Recommended)
Open a local PowerShell terminal in `E:\CEng\Chamas-Academy` and run:
```powershell
powershell -ExecutionPolicy Bypass -File backend/scripts/setup-mysql.ps1
```
The script:
- Prompts for passwords using masked inputs (`Read-Host -AsSecureString`).
- Streams all SQL via STDIN to ensure credentials never appear in process command-line arguments.
- Safely handles special characters (quotes, backslashes, symbols) for SQL and YAML scalars.
- Preserves `chamas_academy` if it already exists.
- Preserves `chamas_user` and asks before modifying its password if it already exists.
- Verifies that DDL (`CREATE TABLE`) is blocked for `chamas_user`.
- Verifies access isolation against unrelated schemas (e.g., `mysql`).
- Writes credentials strictly to `application-local.yml` with restricted user-only file permissions.
- Inspects and reports legacy Windows User environment variables without deleting them automatically.

### Option B: MySQL CLI / Workbench Manual Execution
1. Connect to MySQL as `root`.
2. Run the SQL statements from Section 2.
3. Create `backend/config/application-local.yml` with your chosen password:
   ```yaml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/chamas_academy?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
       username: chamas_user
       password: "<YOUR_PASSWORD>"
   ```
