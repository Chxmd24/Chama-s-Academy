# Chama's Academy – Flyway Database Migration Plan (Final Refinement)

**Database Engine:** MySQL Server 8.0.46
**Total Tables to Create:** **29 Tables** across 6 Versioned Migrations + 1 Repeatable Seed Script
**Security Model:** Two-User Separation of Privileges (DDL Migration Account vs DML Runtime Account)

---

## 1. Security Architecture & Two-User Model

### 1.1 Account Separation of Responsibilities
To prevent runtime vulnerabilities (such as SQL injection) from altering the schema, dropping tables, or bypassing foreign keys:
- The runtime application uses `chamas_user`, which is restricted strictly to **DML** (`SELECT, INSERT, UPDATE, DELETE`).
- Database migrations are executed using `chamas_migrator`, a dedicated account with **DDL** (`CREATE, ALTER, DROP, INDEX, REFERENCES`) and DML privileges.

| Database Account | Host | Granted Privileges | Operational Context |
| :--- | :--- | :--- | :--- |
| `chamas_user` | `localhost` | `SELECT, INSERT, UPDATE, DELETE` on `chamas_academy.*` | **Runtime Web Application** (HikariCP pool, normal requests) |
| `chamas_migrator`| `localhost` | `CREATE, ALTER, DROP, INDEX, REFERENCES, SELECT, INSERT, UPDATE, DELETE` on `chamas_academy.*` | **Migration Engine** (Flyway execution during build/deploy) |

### 1.2 Migration Account Setup SQL (To be executed by Database Administrator)
```sql
-- 1. Create Migration Account
CREATE USER IF NOT EXISTS 'chamas_migrator'@'localhost' IDENTIFIED BY '<STRONG_MIGRATOR_PASSWORD>';

-- 2. Grant DDL & DML permissions on application schema
GRANT CREATE, ALTER, DROP, INDEX, REFERENCES, SELECT, INSERT, UPDATE, DELETE ON chamas_academy.* TO 'chamas_migrator'@'localhost';

-- 3. Flush privileges
FLUSH PRIVILEGES;
```

---

## 2. Spring Boot Configuration & Hibernate Invariants

### 2.1 Preserving `ddl-auto: validate`
In `backend/src/main/resources/application-mysql.yml`, Hibernate must never generate or alter schema at runtime:
```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        format_sql: false
```
`validate` mode ensures that upon startup, Hibernate checks all JPA entities against the actual MySQL tables created by Flyway. If there is any discrepancy in column names, types, or nullability, application startup fails fast with a detailed error.

### 2.2 Flyway Configuration in `application-mysql.yml`
```yaml
spring:
  datasource:
    # Runtime DML pool uses chamas_user
    url: ${SPRING_DATASOURCE_URL:jdbc:mysql://localhost:3306/chamas_academy?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC}
    username: ${SPRING_DATASOURCE_USERNAME:chamas_user}
    password: ${SPRING_DATASOURCE_PASSWORD:}
    driver-class-name: com.mysql.cj.jdbc.Driver

  flyway:
    enabled: true
    baseline-on-migrate: true
    baseline-version: 0
    # Flyway connects with the privileged migration user
    url: ${SPRING_DATASOURCE_URL:jdbc:mysql://localhost:3306/chamas_academy?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC}
    user: ${FLYWAY_USER:chamas_migrator}
    password: ${FLYWAY_PASSWORD:}
    locations:
      - classpath:db/migration
```

---

## 3. Migration Roadmap & Script Ordering (29 Tables Across 7 Migrations)

All migration scripts reside in:
`backend/src/main/resources/db/migration/`

The scripts must strictly adhere to the foreign key dependency order:

```text
db/migration/
├── V1__create_users_roles_and_audit.sql          (4 tables: users, roles, user_roles, audit_logs)
├── V2__seed_initial_roles.sql                    (Idempotent role seeding: CUSTOMER, ADMIN, UMPIRE, REFEREE, STAFF)
├── V3__create_facilities_and_bookings.sql        (3 tables: facilities, bookings, booking_payments)
├── V4__create_teams_players_and_membership.sql   (4 tables: players, teams, team_members, team_membership_requests)
├── V5__create_cricket_engine.sql                 (6 tables: matches, officials, lineups, innings, deliveries, corrections)
├── V6__create_football_engine.sql                (7 tables: matches, officials, lineups, goals, cards, subs, penalty_kicks)
├── V7__create_tournaments_and_standings.sql      (5 tables: tournaments, teams, stages, fixtures, league_standings)
└── R__seed_initial_facilities.sql                (Idempotent seed of parent-child facilities)
```

### Script Breakdown

#### Phase 1: `V1__create_users_roles_and_audit.sql` (4 Tables)
1. `users`: Login identity, BCrypt hash, status, audit timestamps.
2. `roles`: Role dictionary (`ROLE_CUSTOMER`, `ROLE_ADMIN`, `ROLE_UMPIRE`, `ROLE_REFEREE`, `ROLE_STAFF`).
3. `user_roles`: Multi-role join table.
4. `audit_logs`: Administrative actions, payment audits, and security logs.

#### Phase 2: `V2__seed_initial_roles.sql` (Initial Data Seed)
- Idempotently populates approved system roles without hardcoding user credentials:
  `ROLE_CUSTOMER`, `ROLE_ADMIN`, `ROLE_UMPIRE`, `ROLE_REFEREE`, `ROLE_STAFF`.

#### Phase 3: `V3__create_facilities_and_bookings.sql` (3 Tables)
5. `facilities`: Includes `parent_facility_id` self-referential FK for parent-child arena division.
6. `bookings`: Includes `hold_expires_at` (30-min hold), `cancelled_at`, `cancelled_by_user_id`, `cancellation_reason`, `refund_status`, `refund_notes`.
7. `booking_payments`: Secure receipt metadata (`storage_key`, `file_name`, `mime_type`, `file_size_bytes`).

#### Phase 4: `V4__create_teams_players_and_membership.sql` (4 Tables)
8. `players`: Sporting profiles (batting/bowling styles, football preferred positions), optional FK to `users(id)`.
9. `teams`: Cricket and football squads owned by `manager_user_id`.
10. `team_members`: Squad membership rosters and historical records (`LEFT_TEAM`).
11. `team_membership_requests`: Formal player join requests and manager approval/rejection state machine.

#### Phase 5: `V5__create_cricket_engine.sql` (6 Tables)
12. `cricket_matches`: Match configuration (Limited-overs vs Test, overs limit, super overs allowed).
13. `cricket_match_officials`: Umpire and scorer assignments.
14. `cricket_match_lineups`: Playing XI, substitutes, captains, wicket-keepers.
15. `cricket_innings`: Supports regular innings and Super Overs (`innings_type = 'SUPER_OVER'`), declarations, follow-on.
16. `cricket_deliveries`: Immutable ball-by-ball delivery log with monotonic `delivery_index`.
17. `cricket_scoring_corrections`: Auditable correction ledger for amended deliveries.

#### Phase 6: `V6__create_football_engine.sql` (7 Tables)
18. `football_matches`: Configurable formats (5-a-side, 7-a-side, 11-a-side), half durations, player counts.
19. `football_match_officials`: Referee and assistant referee assignments.
20. `football_match_lineups`: Starting lineups and substitutes matching the format.
21. `football_goals`: In-match goals, assists, penalty kicks, own goals.
22. `football_cards`: Yellow, red, and second-yellow bookings.
23. `football_substitutions`: Player substitutions and stoppage minutes.
24. `football_penalty_kicks`: Independent post-match penalty shootout kicks.

#### Phase 7: `V7__create_tournaments_and_standings.sql` (5 Tables)
25. `tournaments`: Competitions, leagues, knockout tournaments.
26. `tournament_teams`: Team registrations and seeding.
27. `tournament_stages`: Group stages, knockout rounds, finals.
28. `tournament_fixtures`: Match scheduling linked to cricket or football matches.
29. `league_standings`: Auto-computed points tables (Points, GD, Cricket NRR).

#### Repeatable Script: `R__seed_initial_facilities.sql`
- Idempotently seeds initial facilities with parent-child structure:
  ```sql
  -- Top-level Parent Arena
  INSERT IGNORE INTO facilities (id, parent_facility_id, name, sport_type, hourly_rate, min_booking_hours, status, description)
  VALUES (1, NULL, 'Main Indoor Arena - Pitch A', 'MULTI_PURPOSE', 5000.00, 1, 'AVAILABLE', 'Full indoor turf arena for football or full-court cricket matches');

  -- Child Facilities (Sub-divided practice nets)
  INSERT IGNORE INTO facilities (id, parent_facility_id, name, sport_type, hourly_rate, min_booking_hours, status, description)
  VALUES (2, 1, 'Arena Pitch A - Net 1', 'CRICKET', 2500.00, 1, 'AVAILABLE', 'Sub-divided cricket batting and bowling net inside Pitch A');

  INSERT IGNORE INTO facilities (id, parent_facility_id, name, sport_type, hourly_rate, min_booking_hours, status, description)
  VALUES (3, 1, 'Arena Pitch A - Net 2', 'CRICKET', 2500.00, 1, 'AVAILABLE', 'Sub-divided cricket batting and bowling net inside Pitch A');

  -- Standalone Football Turf
  INSERT IGNORE INTO facilities (id, parent_facility_id, name, sport_type, hourly_rate, min_booking_hours, status, description)
  VALUES (4, NULL, 'Indoor Football Turf B', 'FOOTBALL', 4500.00, 1, 'AVAILABLE', 'Dedicated 5-a-side and 7-a-side artificial turf arena');
  ```

---

## 4. Execution Workflows & Explicit Opt-In Design

### 4.1 Explicit Opt-In Execution (Separate from Runtime Startup)
- **Ordinary Backend Startup:** Running Spring Boot (`mvn spring-boot:run -Dspring-boot.run.profiles=mysql`) connects using `chamas_user` (DML-only) and has `spring.flyway.enabled: false` by default. Flyway **never** executes automatically during standard runtime startup.
- **Dedicated Migration Runner (`backend/scripts/migrate-database.ps1`):**
  1. Verifies MySQL server connectivity on `localhost:3306`.
  2. Verifies target schema is `chamas_academy`.
  3. Checks existing tables: If tables exist without a `flyway_schema_history` table (unexpected non-empty schema), execution aborts safely and demands human review.
  4. Executes migrations exclusively via `chamas_migrator` without printing credentials to stdout or command-line arguments.

### 4.2 Automated Testing Environment (CI/CD)
- Executes `mvn clean test -f backend/pom.xml`.
- Isolated unit tests (`FlywayMigrationTest`) run `V1` and `V2` against an in-memory H2 database configured in MySQL compatibility mode (`MODE=MySQL;DATABASE_TO_LOWER=TRUE`), validating syntax and constraints with zero risk to live data.

---

## 5. Safety, Verification & Recovery Strategy

### 5.1 Pre-Migration Verification Checklist
Before executing any live migration:
1. Verify database target is `chamas_academy` and not an unrelated schema.
2. Confirm `chamas_migrator` has DDL privileges restricted strictly to `chamas_academy.*`.
3. Confirm `chamas_user` remains restricted strictly to DML (`SELECT, INSERT, UPDATE, DELETE`).
4. For non-empty databases (post-V1/V2), take a logical snapshot:
   ```bash
   mysqldump -u chamas_migrator -p --single-transaction --routines --triggers chamas_academy > pre_migration_backup.sql
   ```

### 5.2 Migration Success Criteria & History Verification
After running the migration, verify:
```sql
-- 1. Check Flyway execution records
SELECT installed_rank, version, description, type, script, execution_time, success
FROM chamas_academy.flyway_schema_history
ORDER BY installed_rank;

-- 2. Confirm exact expected tables exist
SHOW TABLES IN chamas_academy;

-- 3. Verify seeded roles
SELECT id, name, description FROM chamas_academy.roles ORDER BY id;
```
- Every applied migration row must show `success = 1`.
- After `V1` and `V2`, `SHOW TABLES` must return strictly 5 tables (`users`, `roles`, `user_roles`, `audit_logs`, `flyway_schema_history`).

### 5.3 Handling Partially Applied MySQL DDL Migrations
> [!WARNING]
> **MySQL Non-Transactional DDL Behavior:** Unlike PostgreSQL, MySQL 8.0 commits DDL statements (`CREATE TABLE`, `ALTER TABLE`) implicitly. If a migration script fails halfway through (e.g., table 3 fails after tables 1 and 2 were created), tables 1 and 2 remain in the database while Flyway records `success = 0` in `flyway_schema_history`.

**Strict Incident Response Policy:**
- **NEVER** automatically execute `flyway:repair`, `DROP DATABASE`, or `DROP TABLE` via scripts upon error.
- **Manual Recovery Steps:**
  1. Inspect the exact MySQL error message and examine `flyway_schema_history` (`WHERE success = 0`).
  2. Manually inspect which DDL objects were already created via `SHOW TABLES;` and `SHOW CREATE TABLE <name>;`.
  3. On a **new/empty development database** with zero business data: Drop only the partially created tables manually after human verification, fix the SQL script, run `mvn flyway:repair` manually to clear the failed history entry, and re-run migration.
  4. On a **production database** with live data: Restore from the pre-migration `mysqldump` snapshot (`pre_migration_backup.sql`), fix the script in a test environment, and re-deploy.
