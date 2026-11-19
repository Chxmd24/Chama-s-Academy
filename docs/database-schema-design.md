# Chama's Academy – Relational Database Schema Design (Final Refinement)
**System:** Indoor Cricket & Football Stadium Management System
**Engine:** MySQL Server 8.0.46 (InnoDB)
**Encoding:** `utf8mb4`
**Collation:** `utf8mb4_0900_ai_ci`
**Total Tables:** **29 Tables** across 6 Modules
**Status:** Approved & Finalized (Prompt 10)

---

## 1. Executive Summary & Design Principles

This document specifies the finalized 3rd-Normal-Form (3NF) relational database schema for Chama's Academy, fully incorporating the six approved business decisions:
1. **30-Minute Temporary Booking Holds:** Automatic hold expiry mechanism backed by real-time transactional checks and periodic background sweeper jobs.
2. **Offline Refund Management:** Comprehensive cancellation audit trail and refund state machine without online payment gateway complexity.
3. **Player Self-Registration & Request Workflow:** Decoupled player profiles and formal team membership request/approval workflow (`team_membership_requests`).
4. **Cricket Super Overs & Auditable Corrections:** Dedicated Super Over modeling (`innings_type = 'SUPER_OVER'`) and an immutable scoring correction audit ledger (`cricket_scoring_corrections`).
5. **Configurable Indoor Football Formats:** Dynamic match configuration for 5-a-side, 7-a-side, and 11-a-side games with independent penalty shootout tracking (`football_penalty_kicks`).
6. **Multi-Purpose Facility Hierarchies:** Parent-child facility modeling (`parent_facility_id`) with root-facility pessimistic locking to prevent cross-facility scheduling collisions.

---

## 2. Table Inventory & Module Overview (29 Tables)

| Module | Table Name | Key Role in Domain |
| :--- | :--- | :--- |
| **Module 1: User Management & RBAC** (4 tables) | `users` | User credentials, contact info, status, and audit timestamps |
| | `roles` | Role dictionary (`ROLE_CUSTOMER`, `ROLE_ADMIN`, `ROLE_UMPIRE`, `ROLE_REFEREE`, `ROLE_STAFF`) |
| | `user_roles` | Many-to-many user-to-role assignment junction |
| | `audit_logs` | System security, administrative action, and state change audit trail |
| **Module 2: Facilities, Bookings & Payments** (3 tables) | `facilities` | Multi-purpose indoor pitches, courts, and nets with parent-child hierarchy |
| | `bookings` | Slot reservations, 30-minute hold tracking, cancellations, and offline refunds |
| | `booking_payments` | Private file metadata for manual bank transfer slips and verification audit |
| **Module 3: Teams, Players & Membership** (4 tables) | `players` | Sporting profiles (batting/bowling styles, football preferred positions) |
| | `teams` | Cricket and football clubs/squads owned by team managers |
| | `team_members` | Active squad rosters and historical player team membership |
| | `team_membership_requests` | Formal player join requests and manager approval/rejection workflow |
| **Module 4: Cricket Scoring Engine** (6 tables) | `cricket_matches` | Limited-overs and multi-innings Test matches |
| | `cricket_match_officials` | Umpire and scorer match assignments |
| | `cricket_match_lineups` | Match day Playing XI, captains, and wicket-keepers |
| | `cricket_innings` | Innings ledger supporting regular innings and Super Overs |
| | `cricket_deliveries` | Immutable, ball-by-ball delivery log with extras and dismissals |
| | `cricket_scoring_corrections` | Auditable correction history for live delivery score amendments |
| **Module 5: Football Match Engine** (7 tables) | `football_matches` | Configurable matches (5-a-side, 7-a-side, 11-a-side, flexible durations) |
| | `football_match_officials` | Referee and assistant referee assignments |
| | `football_match_lineups` | Dynamic starting lineups and substitutes per match format |
| | `football_goals` | In-game goals, assists, penalty kicks, and own goals |
| | `football_cards` | Disciplinary yellow, red, and second-yellow cards |
| | `football_substitutions` | In-match substitutions and stoppage time logging |
| | `football_penalty_kicks` | Post-match penalty shootout kicks tracked independently |
| **Module 6: Tournaments & Leagues** (5 tables) | `tournaments` | Competitions, leagues, and knockout tournaments |
| | `tournament_teams` | Enrolled and seeded team registrations |
| | `tournament_stages` | Group stages, playoff brackets, and knockout rounds |
| | `tournament_fixtures` | Match fixtures linked to cricket or football matches |
| | `league_standings` | Auto-computed points tables (Points, GD, Cricket NRR) |

---

## 3. Detailed Table Specifications by Module

### Module 1: User Management & Role-Based Access Control (RBAC)

#### 1.1 `users`
| Column | Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | BIGINT | No | PK, AUTO_INCREMENT | Unique user identifier |
| `email` | VARCHAR(255) | No | UNIQUE | User login email address |
| `password_hash` | VARCHAR(255) | No | | BCrypt password hash |
| `first_name` | VARCHAR(100) | No | | First name |
| `last_name` | VARCHAR(100) | No | | Last name |
| `phone_number` | VARCHAR(30) | Yes | | Contact mobile number |
| `status` | VARCHAR(30) | No | DEFAULT 'ACTIVE' | `ACTIVE`, `SUSPENDED`, `DEACTIVATED` |
| `email_verified` | BOOLEAN | No | DEFAULT FALSE | Email verification status |
| `created_at` | TIMESTAMP | No | DEFAULT CURRENT_TIMESTAMP | Audit creation timestamp |
| `updated_at` | TIMESTAMP | No | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Audit update timestamp |

- **Indexes:**
  - `uk_users_email` (UNIQUE: `email`)
  - `idx_users_status` (`status`)

#### 1.2 `roles`
| Column | Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | BIGINT | No | PK, AUTO_INCREMENT | Unique role ID |
| `name` | VARCHAR(50) | No | UNIQUE | `ROLE_CUSTOMER`, `ROLE_ADMIN`, `ROLE_UMPIRE`, `ROLE_REFEREE`, `ROLE_STAFF` |
| `description` | VARCHAR(255) | Yes | | Human-readable explanation of role |
| `created_at` | TIMESTAMP | No | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

- **Indexes:**
  - `uk_roles_name` (UNIQUE: `name`)

#### 1.3 `user_roles`
| Column | Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `user_id` | BIGINT | No | FK -> `users(id)` ON DELETE CASCADE | Associated user |
| `role_id` | BIGINT | No | FK -> `roles(id)` ON DELETE CASCADE | Associated role |
| `assigned_at` | TIMESTAMP | No | DEFAULT CURRENT_TIMESTAMP | Assignment audit timestamp |

- **Primary Key:** `(user_id, role_id)`
- **Indexes:**
  - `idx_user_roles_role_id` (`role_id`)

#### 1.4 `audit_logs`
| Column | Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | BIGINT | No | PK, AUTO_INCREMENT | Unique log ID |
| `user_id` | BIGINT | Yes | FK -> `users(id)` ON DELETE SET NULL | Performing user |
| `action` | VARCHAR(100) | No | | Action code (e.g. `PAYMENT_VERIFIED`, `BOOKING_CANCELLED`) |
| `entity_type` | VARCHAR(50) | No | | Target entity (e.g. `BOOKING`, `PAYMENT`, `TEAM`) |
| `entity_id` | BIGINT | No | | Record ID of target entity |
| `details` | JSON | Yes | | Snapshot or diff payload in JSON |
| `ip_address` | VARCHAR(45) | Yes | | Client IPv4 / IPv6 address |
| `created_at` | TIMESTAMP | No | DEFAULT CURRENT_TIMESTAMP | Action timestamp |

- **Indexes:**
  - `idx_audit_entity` (`entity_type`, `entity_id`)
  - `idx_audit_user` (`user_id`, `created_at`)

---

### Module 2: Facilities, Stadium Bookings & Payments

#### 2.1 `facilities` (Multi-Purpose Parent-Child Support)
| Column | Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | BIGINT | No | PK, AUTO_INCREMENT | Unique facility ID |
| `parent_facility_id`| BIGINT | Yes | FK -> `facilities(id)` ON DELETE RESTRICT | Parent arena (NULL if top-level facility) |
| `name` | VARCHAR(100) | No | UNIQUE | Facility name (e.g. "Main Indoor Arena", "Cricket Net 1") |
| `sport_type` | VARCHAR(30) | No | | `CRICKET`, `FOOTBALL`, `MULTI_PURPOSE` |
| `hourly_rate` | DECIMAL(10, 2) | No | | Standard rate per hour |
| `min_booking_hours` | INT | No | DEFAULT 1 | Minimum booking duration (1 hour) |
| `max_booking_hours` | INT | No | DEFAULT 8 | Maximum single booking duration |
| `status` | VARCHAR(30) | No | DEFAULT 'AVAILABLE' | `AVAILABLE`, `MAINTENANCE`, `INACTIVE` |
| `description` | TEXT | Yes | | Specifications, lighting, pitch type |
| `created_at` | TIMESTAMP | No | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | No | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Update timestamp |

- **Indexes:**
  - `uk_facilities_name` (UNIQUE: `name`)
  - `idx_facilities_parent` (`parent_facility_id`)
  - `idx_facilities_sport_status` (`sport_type`, `status`)

#### 2.2 `bookings` (30-Minute Hold & Offline Refund Tracking)
| Column | Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | BIGINT | No | PK, AUTO_INCREMENT | Unique booking ID |
| `booking_reference` | VARCHAR(36) | No | UNIQUE | Customer code (e.g. `CA-BKG-2026-X8F1`) |
| `user_id` | BIGINT | No | FK -> `users(id)` ON DELETE RESTRICT | Booking customer |
| `facility_id` | BIGINT | No | FK -> `facilities(id)` ON DELETE RESTRICT | Reserved facility |
| `sport_type` | VARCHAR(30) | No | | `CRICKET`, `FOOTBALL` |
| `start_time` | DATETIME | No | | Slot start time |
| `end_time` | DATETIME | No | | Slot end time |
| `total_hours` | DECIMAL(4, 2) | No | | Duration in hours ($\ge 1.00$) |
| `total_amount` | DECIMAL(10, 2) | No | | Total fee (hours $\times$ rate) |
| `status` | VARCHAR(40) | No | DEFAULT 'PENDING_PAYMENT' | `PENDING_PAYMENT`, `PAYMENT_SUBMITTED`, `CONFIRMED`, `REJECTED`, `EXPIRED`, `CANCELLED`, `COMPLETED` |
| `hold_expires_at` | DATETIME | No | | Expiry of 30-min hold ($\text{created\_at} + 30\text{ min}$) |
| `cancelled_at` | DATETIME | Yes | | Timestamp of cancellation |
| `cancelled_by_user_id`| BIGINT | Yes | FK -> `users(id)` ON DELETE SET NULL | User who initiated cancellation |
| `cancellation_reason` | VARCHAR(500) | Yes | | Reason provided for cancellation |
| `refund_status` | VARCHAR(30) | No | DEFAULT 'NOT_APPLICABLE' | `NOT_APPLICABLE`, `PENDING_OFFLINE_REFUND`, `REFUNDED_OFFLINE`, `REFUND_REJECTED` |
| `refund_notes` | TEXT | Yes | | Admin offline transaction details / reference |
| `refund_processed_by_user_id`| BIGINT | Yes | FK -> `users(id)` ON DELETE SET NULL | Admin who processed offline refund |
| `refund_processed_at` | DATETIME | Yes | | Date offline refund was finalized |
| `created_at` | TIMESTAMP | No | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | No | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Update timestamp |

- **Constraints:**
  - `chk_booking_duration`: `(end_time > start_time)`
- **Indexes:**
  - `uk_bookings_reference` (UNIQUE: `booking_reference`)
  - `idx_bookings_facility_interval` (`facility_id`, `start_time`, `end_time`, `status`)
  - `idx_bookings_hold_expiry` (`status`, `hold_expires_at`)
  - `idx_bookings_user` (`user_id`, `created_at`)

#### 2.3 `booking_payments` (Secure Private File Storage Metadata)
| Column | Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | BIGINT | No | PK, AUTO_INCREMENT | Payment ID |
| `booking_id` | BIGINT | No | UNIQUE, FK -> `bookings(id)` ON DELETE CASCADE | Associated booking |
| `payment_method` | VARCHAR(50) | No | DEFAULT 'BANK_TRANSFER' | `BANK_TRANSFER`, `CASH_AT_COUNTER` |
| `bank_name` | VARCHAR(100) | Yes | | Remitting bank |
| `account_holder_name`| VARCHAR(150) | Yes | | Depositor name on slip |
| `transaction_reference`| VARCHAR(100)| Yes | | Bank transaction / transfer reference number |
| `storage_key` | VARCHAR(500) | No | | Internal encrypted storage path (e.g. `receipts/2026/11/uuid.pdf`) |
| `file_name` | VARCHAR(255) | No | | Original uploaded filename |
| `mime_type` | VARCHAR(100) | No | | File MIME type (e.g. `image/jpeg`, `application/pdf`) |
| `file_size_bytes` | BIGINT | No | | File size in bytes for storage auditing |
| `amount_paid` | DECIMAL(10, 2) | No | | Stated amount paid on receipt |
| `payment_date` | DATETIME | No | | Transfer timestamp on receipt |
| `verification_status`| VARCHAR(30) | No | DEFAULT 'PENDING' | `PENDING`, `VERIFIED`, `REJECTED` |
| `verified_by_user_id`| BIGINT | Yes | FK -> `users(id)` ON DELETE SET NULL | Auditing administrator |
| `verified_at` | DATETIME | Yes | | Verification timestamp |
| `rejection_reason` | VARCHAR(500) | Yes | | Reason if rejected by admin |
| `created_at` | TIMESTAMP | No | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | No | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Update timestamp |

- **Indexes:**
  - `uk_payments_booking_id` (UNIQUE: `booking_id`)
  - `idx_payments_verification` (`verification_status`, `created_at`)

---

### Module 3: Teams, Players & Membership Governance

#### 3.1 `players`
| Column | Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | BIGINT | No | PK, AUTO_INCREMENT | Unique player ID |
| `user_id` | BIGINT | Yes | UNIQUE, FK -> `users(id)` ON DELETE SET NULL | Linked user login (optional) |
| `first_name` | VARCHAR(100) | No | | First name |
| `last_name` | VARCHAR(100) | No | | Last name |
| `nickname` | VARCHAR(100) | Yes | | Sporting nickname |
| `date_of_birth` | DATE | Yes | | Birth date |
| `contact_number` | VARCHAR(30) | Yes | | Mobile phone number |
| `cricket_batting_style` | VARCHAR(50) | Yes | | `RIGHT_HAND_BAT`, `LEFT_HAND_BAT` |
| `cricket_bowling_style` | VARCHAR(50) | Yes | | `RIGHT_ARM_FAST`, `RIGHT_ARM_MEDIUM`, `RIGHT_ARM_OFF_SPIN`, `RIGHT_ARM_LEG_SPIN`, `LEFT_ARM_FAST`, `LEFT_ARM_SPIN`, `NONE` |
| `football_preferred_position`| VARCHAR(50) | Yes | | `GOALKEEPER`, `DEFENDER`, `MIDFIELDER`, `FORWARD` |
| `profile_photo_url` | VARCHAR(500) | Yes | | Avatar image URL |
| `created_at` | TIMESTAMP | No | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | No | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Update timestamp |

- **Indexes:**
  - `uk_players_user_id` (UNIQUE: `user_id`)
  - `idx_players_name` (`last_name`, `first_name`)

#### 3.2 `teams`
| Column | Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | BIGINT | No | PK, AUTO_INCREMENT | Unique team ID |
| `name` | VARCHAR(150) | No | | Team name |
| `sport_type` | VARCHAR(30) | No | | `CRICKET`, `FOOTBALL` |
| `manager_user_id` | BIGINT | No | FK -> `users(id)` ON DELETE RESTRICT | Team owner / manager |
| `captain_player_id` | BIGINT | Yes | FK -> `players(id)` ON DELETE SET NULL | Appointed captain |
| `vice_captain_player_id`| BIGINT | Yes | FK -> `players(id)` ON DELETE SET NULL | Appointed vice-captain |
| `logo_url` | VARCHAR(500) | Yes | | Badge/crest image URL |
| `status` | VARCHAR(30) | No | DEFAULT 'ACTIVE' | `ACTIVE`, `INACTIVE`, `DISBANDED` |
| `created_at` | TIMESTAMP | No | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | No | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Update timestamp |

- **Constraints:**
  - `uk_teams_name_sport`: UNIQUE (`name`, `sport_type`)
- **Indexes:**
  - `idx_teams_manager` (`manager_user_id`)

#### 3.3 `team_members` (Active & Historical Squad Membership)
| Column | Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | BIGINT | No | PK, AUTO_INCREMENT | Membership record ID |
| `team_id` | BIGINT | No | FK -> `teams(id)` ON DELETE CASCADE | Associated team |
| `player_id` | BIGINT | No | FK -> `players(id)` ON DELETE CASCADE | Enrolled player |
| `jersey_number` | INT | Yes | | Jersey number (0-99) |
| `role_in_team` | VARCHAR(50) | No | DEFAULT 'PLAYER' | `CAPTAIN`, `VICE_CAPTAIN`, `WICKET_KEEPER`, `GOALKEEPER`, `PLAYER` |
| `status` | VARCHAR(30) | No | DEFAULT 'ACTIVE' | `ACTIVE`, `INACTIVE`, `LEFT_TEAM` |
| `joined_date` | DATE | No | | Enrollment date |
| `left_date` | DATE | Yes | | Departure date (populated when status = `LEFT_TEAM`) |
| `created_at` | TIMESTAMP | No | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | No | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Update timestamp |

- **Indexes:**
  - `idx_team_members_active_unique`: (`team_id`, `player_id`, `status`)
  - `idx_team_members_player`: (`player_id`)

#### 3.4 `team_membership_requests` (Player Self-Registration Workflow)
| Column | Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | BIGINT | No | PK, AUTO_INCREMENT | Request ID |
| `team_id` | BIGINT | No | FK -> `teams(id)` ON DELETE CASCADE | Target team |
| `player_id` | BIGINT | No | FK -> `players(id)` ON DELETE CASCADE | Requesting player |
| `request_type` | VARCHAR(30) | No | DEFAULT 'PLAYER_REQUEST' | `PLAYER_REQUEST` (join request) or `MANAGER_INVITE` |
| `status` | VARCHAR(30) | No | DEFAULT 'PENDING' | `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED` |
| `message` | VARCHAR(500) | Yes | | Cover note from player / manager |
| `responded_by_user_id`| BIGINT | Yes | FK -> `users(id)` ON DELETE SET NULL | Manager who approved/rejected request |
| `response_notes` | VARCHAR(500) | Yes | | Feedback or rejection explanation |
| `responded_at` | DATETIME | Yes | | Timestamp of decision |
| `created_at` | TIMESTAMP | No | DEFAULT CURRENT_TIMESTAMP | Submission timestamp |
| `updated_at` | TIMESTAMP | No | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Update timestamp |

- **Indexes:**
  - `idx_membership_req_team_status`: (`team_id`, `status`)
  - `idx_membership_req_player`: (`player_id`, `status`)

---

### Module 4: Cricket Scoring Engine (Limited-Overs, Test & Super Overs)

#### 4.1 `cricket_matches`
| Column | Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | BIGINT | No | PK, AUTO_INCREMENT | Unique match ID |
| `match_code` | VARCHAR(50) | No | UNIQUE | Match reference (e.g. `CA-CRIC-2026-M01`) |
| `match_type` | VARCHAR(30) | No | | `LIMITED_OVERS`, `TEST` |
| `overs_limit` | INT | Yes | | Overs per innings (e.g., 20, 10, 50; NULL for Test) |
| `days_limit` | INT | Yes | DEFAULT 1 | Duration in days (e.g. 1 for T20, 3-5 for Test) |
| `super_overs_allowed`| BOOLEAN | No | DEFAULT TRUE | Can match proceed to Super Overs on a tie? |
| `tournament_id` | BIGINT | Yes | FK -> `tournaments(id)` ON DELETE SET NULL | Tournament |
| `facility_id` | BIGINT | Yes | FK -> `facilities(id)` ON DELETE SET NULL | Pitch/arena |
| `scheduled_start_time`| DATETIME | No | | Start date/time |
| `team1_id` | BIGINT | No | FK -> `teams(id)` ON DELETE RESTRICT | Team 1 |
| `team2_id` | BIGINT | No | FK -> `teams(id)` ON DELETE RESTRICT | Team 2 |
| `toss_winner_team_id`| BIGINT | Yes | FK -> `teams(id)` ON DELETE SET NULL | Toss winner |
| `toss_decision` | VARCHAR(20) | Yes | | `BAT`, `BOWL` |
| `status` | VARCHAR(30) | No | DEFAULT 'SCHEDULED' | `SCHEDULED`, `TOSS_COMPLETED`, `IN_PROGRESS`, `INNINGS_BREAK`, `SUPER_OVER`, `COMPLETED`, `TIED`, `NO_RESULT`, `ABANDONED` |
| `winner_team_id` | BIGINT | Yes | FK -> `teams(id)` ON DELETE SET NULL | Victorious team |
| `result_type` | VARCHAR(50) | Yes | | `WIN_BY_RUNS`, `WIN_BY_WICKETS`, `WIN_BY_INNINGS`, `WIN_BY_SUPER_OVER`, `DRAW`, `TIE`, `NO_RESULT` |
| `result_margin` | INT | Yes | | Numerical margin (runs/wickets) |
| `result_description` | VARCHAR(255) | Yes | | Match summary statement |
| `player_of_the_match_id`| BIGINT | Yes | FK -> `players(id)` ON DELETE SET NULL | MVP award |
| `created_at` | TIMESTAMP | No | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | No | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Update timestamp |

- **Indexes:**
  - `uk_cricket_matches_code` (UNIQUE: `match_code`)
  - `idx_cricket_matches_teams` (`team1_id`, `team2_id`)
  - `idx_cricket_matches_status` (`status`, `scheduled_start_time`)

#### 4.2 `cricket_match_officials`
| Column | Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | BIGINT | No | PK, AUTO_INCREMENT | Official ID |
| `match_id` | BIGINT | No | FK -> `cricket_matches(id)` ON DELETE CASCADE | Associated match |
| `user_id` | BIGINT | No | FK -> `users(id)` ON DELETE RESTRICT | Official user |
| `official_role` | VARCHAR(50) | No | | `UMPIRE_1`, `UMPIRE_2`, `THIRD_UMPIRE`, `SCORER`, `MATCH_REFEREE` |

- **Constraints:**
  - `uk_cricket_officials`: UNIQUE (`match_id`, `official_role`)

#### 4.3 `cricket_match_lineups`
| Column | Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | BIGINT | No | PK, AUTO_INCREMENT | Lineup ID |
| `match_id` | BIGINT | No | FK -> `cricket_matches(id)` ON DELETE CASCADE | Associated match |
| `team_id` | BIGINT | No | FK -> `teams(id)` ON DELETE CASCADE | Participating team |
| `player_id` | BIGINT | No | FK -> `players(id)` ON DELETE CASCADE | Selected player |
| `batting_order` | INT | Yes | | Batting position (1-11) |
| `is_captain` | BOOLEAN | No | DEFAULT FALSE | Captain flag |
| `is_wicket_keeper` | BOOLEAN | No | DEFAULT FALSE | Wicket-keeper flag |
| `is_substitute` | BOOLEAN | No | DEFAULT FALSE | 12th man / substitute flag |

- **Constraints:**
  - `uk_cricket_lineup_player`: UNIQUE (`match_id`, `player_id`)

#### 4.4 `cricket_innings` (Super Over & Test Cricket Support)
| Column | Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | BIGINT | No | PK, AUTO_INCREMENT | Innings ID |
| `match_id` | BIGINT | No | FK -> `cricket_matches(id)` ON DELETE CASCADE | Target match |
| `innings_number` | INT | No | | Sequence index (1, 2, 3...) |
| `innings_type` | VARCHAR(30) | No | DEFAULT 'REGULAR' | `REGULAR`, `SUPER_OVER` |
| `super_over_number` | INT | Yes | | Sequence for Super Overs (1 for 1st SO, 2 for 2nd SO; NULL for regular) |
| `batting_team_id` | BIGINT | No | FK -> `teams(id)` ON DELETE RESTRICT | Batting team |
| `bowling_team_id` | BIGINT | No | FK -> `teams(id)` ON DELETE RESTRICT | Bowling team |
| `status` | VARCHAR(30) | No | DEFAULT 'IN_PROGRESS' | `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`, `DECLARED` |
| `is_declared` | BOOLEAN | No | DEFAULT FALSE | Captain declared innings closed (Test cricket) |
| `is_follow_on` | BOOLEAN | No | DEFAULT FALSE | Team enforced to follow-on (Test cricket) |
| `total_runs` | INT | No | DEFAULT 0 | Runs scored |
| `total_wickets` | INT | No | DEFAULT 0 | Wickets lost (0-10, or max 2 for Super Over) |
| `total_overs_bowled`| DECIMAL(5, 1) | No | DEFAULT 0.0 | Overs completed (e.g. 19.4) |
| `total_byes` | INT | No | DEFAULT 0 | Accumulated byes |
| `total_leg_byes` | INT | No | DEFAULT 0 | Accumulated leg-byes |
| `total_wides` | INT | No | DEFAULT 0 | Accumulated wide extras |
| `total_no_balls` | INT | No | DEFAULT 0 | Accumulated no-ball extras |
| `total_penalties` | INT | No | DEFAULT 0 | Accumulated penalty runs |
| `created_at` | TIMESTAMP | No | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | No | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Update timestamp |

- **Constraints:**
  - `uk_cricket_innings_seq`: UNIQUE (`match_id`, `innings_number`)
- **Indexes:**
  - `idx_cricket_innings_type`: (`match_id`, `innings_type`)

#### 4.5 `cricket_deliveries` (Ball-by-Ball Immutable Ledger)
| Column | Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | BIGINT | No | PK, AUTO_INCREMENT | Delivery ID |
| `innings_id` | BIGINT | No | FK -> `cricket_innings(id)` ON DELETE CASCADE | Target innings |
| `over_number` | INT | No | | Over count (1, 2, ...) |
| `ball_number` | INT | No | | Ball count within over |
| `delivery_index` | INT | No | | Monotonic sequential counter per innings (1, 2, 3...) |
| `is_legal_delivery`| BOOLEAN | No | DEFAULT TRUE | `FALSE` if wide or no-ball |
| `bowler_player_id` | BIGINT | No | FK -> `players(id)` ON DELETE RESTRICT | Bowler delivering ball |
| `striker_player_id`| BIGINT | No | FK -> `players(id)` ON DELETE RESTRICT | Batsman facing ball |
| `non_striker_player_id`| BIGINT | No | FK -> `players(id)` ON DELETE RESTRICT | Batsman at bowler's end |
| `runs_off_bat` | INT | No | DEFAULT 0 | Runs off bat (0, 1, 2, 3, 4, 6) |
| `extras_runs` | INT | No | DEFAULT 0 | Extra runs |
| `extra_type` | VARCHAR(30) | Yes | | `NONE`, `WIDE`, `NO_BALL`, `BYE`, `LEG_BYE`, `PENALTY` |
| `is_wicket` | BOOLEAN | No | DEFAULT FALSE | Dismissal occurred? |
| `dismissal_type` | VARCHAR(50) | Yes | | `BOWLED`, `CAUGHT`, `LBW`, `RUN_OUT`, `STUMPED`, `HIT_WICKET`, `OBSTRUCTING_FIELD`, `RETIRED_HURT` |
| `dismissed_player_id`| BIGINT | Yes | FK -> `players(id)` ON DELETE RESTRICT | Out batsman |
| `fielder_player_id`| BIGINT | Yes | FK -> `players(id)` ON DELETE RESTRICT | Primary fielder involved |
| `assisted_fielder_id`| BIGINT | Yes | FK -> `players(id)` ON DELETE RESTRICT | Assisting fielder (relay run-out) |
| `is_corrected` | BOOLEAN | No | DEFAULT FALSE | Flag indicating delivery was amended |
| `correction_notes` | VARCHAR(255) | Yes | | Summary of correction |
| `commentary` | VARCHAR(500) | Yes | | Live ball text commentary |
| `created_at` | TIMESTAMP | No | DEFAULT CURRENT_TIMESTAMP | Delivery timestamp |

- **Constraints:**
  - `uk_cricket_deliveries_seq`: UNIQUE (`innings_id`, `delivery_index`)
- **Indexes:**
  - `idx_cricket_deliv_over`: (`innings_id`, `over_number`, `ball_number`)
  - `idx_cricket_deliv_striker`: (`striker_player_id`)
  - `idx_cricket_deliv_bowler`: (`bowler_player_id`)

#### 4.6 `cricket_scoring_corrections` (Scoring Audit Ledger)
| Column | Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | BIGINT | No | PK, AUTO_INCREMENT | Correction log ID |
| `delivery_id` | BIGINT | No | FK -> `cricket_deliveries(id)` ON DELETE CASCADE | Delivery amended |
| `innings_id` | BIGINT | No | FK -> `cricket_innings(id)` ON DELETE CASCADE | Associated innings |
| `corrected_by_user_id`| BIGINT | No | FK -> `users(id)` ON DELETE RESTRICT | Official who authorized change |
| `previous_data` | JSON | No | | Snapshot of runs/extras/wickets before fix |
| `new_data` | JSON | No | | Snapshot of runs/extras/wickets after fix |
| `reason` | VARCHAR(500) | No | | Official explanation (e.g. "DRS review overturned") |
| `created_at` | TIMESTAMP | No | DEFAULT CURRENT_TIMESTAMP | Audit timestamp |

- **Indexes:**
  - `idx_scoring_corr_delivery`: (`delivery_id`)
  - `idx_scoring_corr_innings`: (`innings_id`)

---

### Module 5: Football Match Engine (Configurable Formats & Shootouts)

#### 5.1 `football_matches`
| Column | Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | BIGINT | No | PK, AUTO_INCREMENT | Unique match ID |
| `match_code` | VARCHAR(50) | No | UNIQUE | Match reference (e.g. `CA-FOOT-2026-M01`) |
| `format` | VARCHAR(30) | No | DEFAULT 'FIVE_A_SIDE' | `FIVE_A_SIDE`, `SEVEN_A_SIDE`, `ELEVEN_A_SIDE`, `CUSTOM` |
| `half_duration_minutes`| INT | No | DEFAULT 20 | Half length in minutes (e.g., 20, 25, 45) |
| `players_per_team` | INT | No | DEFAULT 5 | Active starting players per team (5, 7, 11) |
| `max_substitutes` | INT | No | DEFAULT 5 | Bench capacity limit |
| `extra_time_enabled`| BOOLEAN | No | DEFAULT FALSE | Does match support extra time? |
| `extra_time_half_duration_minutes`| INT | Yes | DEFAULT 5 | Duration of extra time halves |
| `penalty_shootout_enabled`| BOOLEAN | No | DEFAULT FALSE | Does match resolve ties with shootouts? |
| `tournament_id` | BIGINT | Yes | FK -> `tournaments(id)` ON DELETE SET NULL | Tournament |
| `facility_id` | BIGINT | Yes | FK -> `facilities(id)` ON DELETE SET NULL | Football turf |
| `scheduled_start_time`| DATETIME | No | | Kickoff time |
| `home_team_id` | BIGINT | No | FK -> `teams(id)` ON DELETE RESTRICT | Home team |
| `away_team_id` | BIGINT | No | FK -> `teams(id)` ON DELETE RESTRICT | Away team |
| `status` | VARCHAR(30) | No | DEFAULT 'SCHEDULED' | `SCHEDULED`, `FIRST_HALF`, `HALF_TIME`, `SECOND_HALF`, `EXTRA_TIME`, `PENALTY_SHOOTOUT`, `COMPLETED`, `ABANDONED` |
| `current_minute` | INT | No | DEFAULT 0 | Match clock minute |
| `home_score` | INT | No | DEFAULT 0 | Regulation/ET score |
| `away_score` | INT | No | DEFAULT 0 | Regulation/ET score |
| `home_penalty_score`| INT | Yes | | Shootout penalty score |
| `away_penalty_score`| INT | Yes | | Shootout penalty score |
| `winner_team_id` | BIGINT | Yes | FK -> `teams(id)` ON DELETE SET NULL | Victorious team |
| `is_draw` | BOOLEAN | No | DEFAULT FALSE | True if match ended in a draw |
| `created_at` | TIMESTAMP | No | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | No | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Update timestamp |

- **Indexes:**
  - `uk_football_matches_code` (UNIQUE: `match_code`)
  - `idx_football_matches_teams` (`home_team_id`, `away_team_id`)
  - `idx_football_matches_status` (`status`, `scheduled_start_time`)

#### 5.2 `football_match_officials`
| Column | Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | BIGINT | No | PK, AUTO_INCREMENT | Official ID |
| `match_id` | BIGINT | No | FK -> `football_matches(id)` ON DELETE CASCADE | Associated match |
| `user_id` | BIGINT | No | FK -> `users(id)` ON DELETE RESTRICT | Referee user |
| `official_role` | VARCHAR(50) | No | | `MAIN_REFEREE`, `ASSISTANT_REFEREE_1`, `ASSISTANT_REFEREE_2`, `FOURTH_OFFICIAL` |

- **Constraints:**
  - `uk_football_officials`: UNIQUE (`match_id`, `official_role`)

#### 5.3 `football_match_lineups`
| Column | Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | BIGINT | No | PK, AUTO_INCREMENT | Lineup ID |
| `match_id` | BIGINT | No | FK -> `football_matches(id)` ON DELETE CASCADE | Match |
| `team_id` | BIGINT | No | FK -> `teams(id)` ON DELETE CASCADE | Team |
| `player_id` | BIGINT | No | FK -> `players(id)` ON DELETE CASCADE | Player |
| `position` | VARCHAR(50) | No | | `GK`, `DEF`, `MID`, `FWD`, `SUB` |
| `is_starting` | BOOLEAN | No | DEFAULT TRUE | True for starting lineup, false for bench |
| `is_captain` | BOOLEAN | No | DEFAULT FALSE | Captain flag |

- **Constraints:**
  - `uk_football_lineup_player`: UNIQUE (`match_id`, `player_id`)

#### 5.4 `football_goals`
| Column | Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | BIGINT | No | PK, AUTO_INCREMENT | Goal ID |
| `match_id` | BIGINT | No | FK -> `football_matches(id)` ON DELETE CASCADE | Match |
| `team_id` | BIGINT | No | FK -> `teams(id)` ON DELETE CASCADE | Scoring team |
| `scorer_player_id` | BIGINT | No | FK -> `players(id)` ON DELETE RESTRICT | Scorer |
| `assist_player_id` | BIGINT | Yes | FK -> `players(id)` ON DELETE SET NULL | Assister |
| `minute` | INT | No | | Match minute |
| `stoppage_minute` | INT | Yes | | Extra time minute (e.g. 20 + 2) |
| `goal_type` | VARCHAR(30) | No | DEFAULT 'REGULAR' | `REGULAR`, `PENALTY`, `OWN_GOAL`, `FREE_KICK` |
| `created_at` | TIMESTAMP | No | DEFAULT CURRENT_TIMESTAMP | Timestamp |

- **Indexes:**
  - `idx_football_goals_match`: (`match_id`, `minute`)

#### 5.5 `football_cards`
| Column | Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | BIGINT | No | PK, AUTO_INCREMENT | Card ID |
| `match_id` | BIGINT | No | FK -> `football_matches(id)` ON DELETE CASCADE | Match |
| `team_id` | BIGINT | No | FK -> `teams(id)` ON DELETE CASCADE | Team of player |
| `player_id` | BIGINT | No | FK -> `players(id)` ON DELETE RESTRICT | Booked player |
| `minute` | INT | No | | Match minute |
| `stoppage_minute` | INT | Yes | | Stoppage minute |
| `card_type` | VARCHAR(30) | No | | `YELLOW`, `RED`, `SECOND_YELLOW` |
| `reason` | VARCHAR(255) | Yes | | Infraction description |
| `created_at` | TIMESTAMP | No | DEFAULT CURRENT_TIMESTAMP | Timestamp |

- **Indexes:**
  - `idx_football_cards_match`: (`match_id`, `player_id`)

#### 5.6 `football_substitutions`
| Column | Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | BIGINT | No | PK, AUTO_INCREMENT | Substitution ID |
| `match_id` | BIGINT | No | FK -> `football_matches(id)` ON DELETE CASCADE | Match |
| `team_id` | BIGINT | No | FK -> `teams(id)` ON DELETE CASCADE | Team |
| `player_off_id` | BIGINT | No | FK -> `players(id)` ON DELETE RESTRICT | Replaced player |
| `player_on_id` | BIGINT | No | FK -> `players(id)` ON DELETE RESTRICT | Entering player |
| `minute` | INT | No | | Match minute |
| `stoppage_minute` | INT | Yes | | Stoppage minute |
| `created_at` | TIMESTAMP | No | DEFAULT CURRENT_TIMESTAMP | Timestamp |

- **Indexes:**
  - `idx_football_subs_match`: (`match_id`, `team_id`)

#### 5.7 `football_penalty_kicks` (Shootout Tracker)
| Column | Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | BIGINT | No | PK, AUTO_INCREMENT | Shootout kick ID |
| `match_id` | BIGINT | No | FK -> `football_matches(id)` ON DELETE CASCADE | Match |
| `team_id` | BIGINT | No | FK -> `teams(id)` ON DELETE CASCADE | Kicking team |
| `kicker_player_id` | BIGINT | No | FK -> `players(id)` ON DELETE RESTRICT | Penalty taker |
| `goalkeeper_player_id`| BIGINT| No | FK -> `players(id)` ON DELETE RESTRICT | Opposing goalkeeper |
| `kick_number` | INT | No | | Sequential kick order for team (1, 2, 3...) |
| `is_scored` | BOOLEAN | No | | `TRUE` if converted, `FALSE` if missed/saved |
| `created_at` | TIMESTAMP | No | DEFAULT CURRENT_TIMESTAMP | Timestamp |

- **Constraints:**
  - `uk_penalty_kick_order`: UNIQUE (`match_id`, `team_id`, `kick_number`)

---

### Module 6: Tournaments & Leagues

#### 6.1 `tournaments`
| Column | Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | BIGINT | No | PK, AUTO_INCREMENT | Unique tournament ID |
| `name` | VARCHAR(150) | No | | Competition name |
| `sport_type` | VARCHAR(30) | No | | `CRICKET`, `FOOTBALL` |
| `format` | VARCHAR(50) | No | | `ROUND_ROBIN`, `KNOCKOUT`, `GROUP_STAGE_KNOCKOUT` |
| `start_date` | DATE | No | | Start date |
| `end_date` | DATE | No | | End date |
| `status` | VARCHAR(30) | No | DEFAULT 'DRAFT' | `DRAFT`, `REGISTRATION_OPEN`, `REGISTRATION_CLOSED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED` |
| `max_teams` | INT | No | DEFAULT 16 | Team capacity |
| `registration_fee` | DECIMAL(10, 2) | No | DEFAULT 0.00 | Entry fee |
| `champion_team_id` | BIGINT | Yes | FK -> `teams(id)` ON DELETE SET NULL | Winner |
| `runner_up_team_id`| BIGINT | Yes | FK -> `teams(id)` ON DELETE SET NULL | Second place |
| `created_at` | TIMESTAMP | No | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | No | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Update timestamp |

- **Indexes:**
  - `idx_tournaments_sport_status`: (`sport_type`, `status`)

#### 6.2 `tournament_teams`
| Column | Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | BIGINT | No | PK, AUTO_INCREMENT | Enrollment ID |
| `tournament_id` | BIGINT | No | FK -> `tournaments(id)` ON DELETE CASCADE | Tournament |
| `team_id` | BIGINT | No | FK -> `teams(id)` ON DELETE CASCADE | Enrolled team |
| `registration_date`| TIMESTAMP | No | DEFAULT CURRENT_TIMESTAMP | Submission date |
| `status` | VARCHAR(30) | No | DEFAULT 'PENDING' | `PENDING`, `APPROVED`, `REJECTED`, `WITHDRAWN` |
| `seed_number` | INT | Yes | | Tournament seeding |
| `group_name` | VARCHAR(20) | Yes | | Pool assignment (e.g. `Group A`) |

- **Constraints:**
  - `uk_tournament_teams`: UNIQUE (`tournament_id`, `team_id`)

#### 6.3 `tournament_stages`
| Column | Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | BIGINT | No | PK, AUTO_INCREMENT | Stage ID |
| `tournament_id` | BIGINT | No | FK -> `tournaments(id)` ON DELETE CASCADE | Tournament |
| `stage_name` | VARCHAR(100) | No | | `Group Stage`, `Quarter-Final`, `Semi-Final`, `Final` |
| `stage_type` | VARCHAR(30) | No | | `GROUP_STAGE`, `KNOCKOUT` |
| `stage_order` | INT | No | | Chronological order (1, 2, 3...) |

- **Constraints:**
  - `uk_tournament_stages_seq`: UNIQUE (`tournament_id`, `stage_order`)

#### 6.4 `tournament_fixtures`
| Column | Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | BIGINT | No | PK, AUTO_INCREMENT | Fixture ID |
| `tournament_id` | BIGINT | No | FK -> `tournaments(id)` ON DELETE CASCADE | Tournament |
| `stage_id` | BIGINT | No | FK -> `tournament_stages(id)` ON DELETE CASCADE | Stage |
| `sport_type` | VARCHAR(30) | No | | `CRICKET`, `FOOTBALL` |
| `cricket_match_id` | BIGINT | Yes | UNIQUE, FK -> `cricket_matches(id)` ON DELETE SET NULL | Linked cricket match |
| `football_match_id`| BIGINT | Yes | UNIQUE, FK -> `football_matches(id)` ON DELETE SET NULL | Linked football match |
| `team1_id` | BIGINT | No | FK -> `teams(id)` ON DELETE RESTRICT | First team |
| `team2_id` | BIGINT | No | FK -> `teams(id)` ON DELETE RESTRICT | Second team |
| `fixture_number` | INT | No | | Fixture number in stage |
| `scheduled_time` | DATETIME | No | | Scheduled kickoff / start |
| `facility_id` | BIGINT | Yes | FK -> `facilities(id)` ON DELETE SET NULL | Allocated pitch/arena |
| `status` | VARCHAR(30) | No | DEFAULT 'SCHEDULED' | `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED` |
| `winner_team_id` | BIGINT | Yes | FK -> `teams(id)` ON DELETE SET NULL | Winner |

- **Indexes:**
  - `idx_fixtures_stage`: (`stage_id`, `fixture_number`)

#### 6.5 `league_standings`
| Column | Type | Nullable | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | BIGINT | No | PK, AUTO_INCREMENT | Standings record ID |
| `tournament_id` | BIGINT | No | FK -> `tournaments(id)` ON DELETE CASCADE | Tournament |
| `stage_id` | BIGINT | No | FK -> `tournament_stages(id)` ON DELETE CASCADE | Stage |
| `group_name` | VARCHAR(20) | Yes | | Pool identifier |
| `team_id` | BIGINT | No | FK -> `teams(id)` ON DELETE CASCADE | Ranked team |
| `played` | INT | No | DEFAULT 0 | Matches played |
| `won` | INT | No | DEFAULT 0 | Wins |
| `drawn` | INT | No | DEFAULT 0 | Draws (Football) |
| `lost` | INT | No | DEFAULT 0 | Losses |
| `tied` | INT | No | DEFAULT 0 | Ties (Cricket) |
| `no_result` | INT | No | DEFAULT 0 | Abandoned matches |
| `points` | INT | No | DEFAULT 0 | Total league points |
| `goals_for` | INT | No | DEFAULT 0 | Goals scored (Football) |
| `goals_against` | INT | No | DEFAULT 0 | Goals conceded (Football) |
| `goal_difference`| INT | No | DEFAULT 0 | (goals_for - goals_against) |
| `runs_scored` | INT | No | DEFAULT 0 | Total runs hit (Cricket) |
| `overs_faced` | DECIMAL(5, 1) | No | DEFAULT 0.0 | Overs faced (Cricket) |
| `runs_conceded` | INT | No | DEFAULT 0 | Total runs allowed (Cricket) |
| `overs_bowled` | DECIMAL(5, 1) | No | DEFAULT 0.0 | Overs delivered (Cricket) |
| `net_run_rate` | DECIMAL(6, 3) | No | DEFAULT 0.000 | Net Run Rate (Cricket) |
| `rank_position` | INT | No | DEFAULT 1 | Current league rank |
| `updated_at` | TIMESTAMP | No | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Recalculated timestamp |

- **Constraints:**
  - `uk_league_standings`: UNIQUE (`stage_id`, `team_id`)

---

## 4. Multi-Purpose Facility Concurrency Architecture (Decision 6)

### 4.1 Collision Matrix Across Hierarchical Spaces
> **Hierarchy Invariant:** The facility hierarchy is strictly **single-level** (Depth = 1). Top-level arenas have `parent_facility_id = NULL`; child sub-divisions have `parent_facility_id` pointing to the top-level arena. Child facilities are strictly prohibited from having child facilities of their own.

```text
Parent Facility: "Main Indoor Arena - Pitch A"
 ├── Child 1: "Arena Pitch A - Net 1" (Practice Net)
 └── Child 2: "Arena Pitch A - Net 2" (Practice Net)
```

| Incoming Booking Target | Conflicting Active Reservations in `[start, end)` | Result |
| :--- | :--- | :--- |
| **Parent (Arena A)** | Existing Parent booking OR Child 1 booking OR Child 2 booking | **REJECTED (COLLISION)** |
| **Child 1 (Net 1)** | Existing Parent booking OR Child 1 booking | **REJECTED (COLLISION)** |
| **Child 1 (Net 1)** | Existing Child 2 booking ONLY | **ACCEPTED (COMPATIBLE)** |
| **Child 2 (Net 2)** | Existing Child 1 booking ONLY | **ACCEPTED (COMPATIBLE)** |

### 4.2 Safe Concurrency Control Algorithm (InnoDB Pessimistic Locking)
To eliminate race conditions when two customers attempt to book the parent and child facilities simultaneously:
1. **Derive Root Facility:**
   ```java
   Long rootFacilityId = facility.getParentFacilityId() != null
       ? facility.getParentFacilityId()
       : facility.getId();
   ```
2. **Execute Transactional Locking:**
   ```sql
   START TRANSACTION;

   -- Step 1: Serialize all operations for this facility hierarchy on the Root Facility row
   SELECT id FROM facilities WHERE id = :rootFacilityId FOR UPDATE;

   -- Step 2: Query for active collisions across parent and children
   SELECT COUNT(*)
   FROM bookings b
   JOIN facilities f ON b.facility_id = f.id
   WHERE (
       -- Conflict 1: Direct facility match
       b.facility_id = :targetFacilityId
       -- Conflict 2: Target is child, checking if parent is booked
       OR (:isChild = TRUE AND b.facility_id = :parentFacilityId)
       -- Conflict 3: Target is parent, checking if any child is booked
       OR (:isParent = TRUE AND f.parent_facility_id = :targetFacilityId)
   )
   -- Active blocking conditions (Rule 1.2):
   AND (
       b.status IN ('CONFIRMED', 'PAYMENT_SUBMITTED')
       OR (b.status = 'PENDING_PAYMENT' AND b.hold_expires_at > NOW())
   )
   -- Overlap condition:
   AND b.start_time < :requestedEnd
   AND b.end_time > :requestedStart;

   -- Step 3: If count > 0 -> ROLLBACK and throw SlotUnavailableException
   -- If count == 0 -> INSERT booking with hold_expires_at = NOW() + 30 MIN -> COMMIT;
   COMMIT;
   ```

---

## 5. Security & Sensitive Data Handling

1. **Private Bank Slip File Storage:**
   - Receipt images are **never stored as database BLOBs** (to protect database memory and backup sizing) and **never served via public static URLs**.
   - `booking_payments.storage_key` stores an internal object key (e.g. `receipts/2026/11/uuid.pdf`).
   - Files are fetched strictly through an authenticated Spring Boot controller requiring `ROLE_ADMIN` authorization:
     `GET /api/admin/bookings/{id}/receipt -> ResponseEntity<Resource>`
2. **Password Security:**
   - User passwords are stored using BCrypt (`password_hash`, 60-character salted hash).
   - Plaintext passwords are never logged or stored.
3. **Idempotency Keys:**
   - `booking_reference` ensures duplicate HTTP submissions cannot create redundant reservations.
