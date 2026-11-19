# Chama's Academy – Approved Business Rules & System Invariants

**System:** Indoor Cricket & Football Stadium Management System
**Document:** Official Business Rules & Architectural Invariants
**Status:** Approved & Finalized (Prompt 10)

---

## 1. Overview & Authority

This document formalizes the six core business decisions approved by management for the Chama's Academy platform. These rules serve as mandatory domain invariants governing the database schema design, transactional concurrency controls, state machines, and Spring Boot service layer logic.

---

## 2. Decision 1: Booking Hold Duration & Concurrency Lifecycle

### Rule 1.1: 30-Minute Temporary Hold Expiry
- When a customer initiates a reservation for an available facility slot, the system creates a booking in `PENDING_PAYMENT` status with a strict 30-minute hold window:
  $$\text{hold\_expires\_at} = \text{created\_at} + 30\text{ minutes}$$
- During this 30-minute period, the slot is reserved exclusively for the customer to facilitate manual bank transfer remittal and payment slip upload.

### Rule 1.2: Status Transitions & Availability Blocking
Facility availability is determined strictly by booking status and the hold timestamp:

| Status | Blocks Slot Availability? | Transition Triggers & Business Rules |
| :--- | :---: | :--- |
| `PENDING_PAYMENT` | **YES** *(if not expired)* | Initial state upon reservation. Blocks new bookings **only if** $\text{hold\_expires\_at} > \text{NOW()}$. Expired holds ($\le \text{NOW()}$) do **not** block availability. |
| `PAYMENT_SUBMITTED` | **YES** | Triggered immediately when customer uploads bank transfer receipt slip. **Freezes hold expiration**. The slot remains locked indefinitely while awaiting administrator audit. |
| `CONFIRMED` | **YES** | Administrator approves bank transfer payment receipt. Booking is officially secured. |
| `REJECTED` | **NO** | Administrator rejects bank transfer receipt (e.g. invalid reference, insufficient amount, unreadable slip). Slot immediately becomes available for re-booking. |
| `EXPIRED` | **NO** | Customer failed to upload receipt within 30 minutes. Slot is released. |
| `CANCELLED` | **NO** | Booking cancelled by customer or administrator. Slot is released. |
| `COMPLETED` | **NO** | Facility utilization period has elapsed following a confirmed booking. |

### Rule 1.3: Hold Expiry Mechanism (Dual-Layer Safety)
1. **Inline Transactional Check (Real-Time):** When any customer checks availability or attempts to book a slot, the query ignores `PENDING_PAYMENT` rows where $\text{hold\_expires\_at} \le \text{NOW()}$. An incoming transaction encountering an expired hold automatically transitions it to `EXPIRED` atomically.
2. **Scheduled Sweeper Job (Background):** A Spring Boot scheduled job (`@Scheduled(cron = "0 */2 * * * *")`) executes every 2 minutes, querying:
   ```sql
   UPDATE bookings
   SET status = 'EXPIRED', updated_at = NOW()
   WHERE status = 'PENDING_PAYMENT' AND hold_expires_at <= NOW();
   ```

---

## 3. Decision 2: Cancellations, Refunds & Auditability

### Rule 2.1: Offline Refund Management
- Stadium management handles all customer refunds **strictly offline** (e.g. manual bank transfer refund or physical counter disbursement).
- The platform **does not** implement online refund payment gateways, third-party wallet APIs, or store-credit ledgers.

### Rule 2.2: Cancellation & Refund Tracking Fields
When a booking is cancelled, the system preserves complete historical and financial audit trails without deleting records:
- `cancelled_at`: Timestamp when cancellation was requested.
- `cancelled_by_user_id`: Reference to user (customer self-cancellation or administrator).
- `cancellation_reason`: Text explanation provided by the actor.
- `refund_status`: Explicit state machine tracking:
  - `NOT_APPLICABLE`: For unpaid, expired, or rejected bookings where no funds were received.
  - `PENDING_OFFLINE_REFUND`: Set when a confirmed booking is cancelled, alerting stadium accounting to process an offline refund.
  - `REFUNDED_OFFLINE`: Administrator records that offline bank transfer/cash refund has been completed.
  - `REFUND_REJECTED`: Management determines the cancellation violates stadium policy (e.g. last-minute cancellation < 12 hours) and denies refund.
- `refund_notes`: Detailed reference recorded by administrator (e.g. bank transfer reference number, counter voucher receipt).
- `refund_processed_by_user_id`: Reference to administrator who executed the refund.
- `refund_processed_at`: Timestamp of refund completion.

---

## 4. Decision 3: Player Registration & Team Membership Governance

### Rule 3.1: Independent Player Registration
- Players can self-register on the platform and manage their sporting profiles (batting style, bowling style, preferred football position).
- A player profile may link to a user login account (`user_id`), or exist as a manager-created roster profile for guest/non-registered participants.

### Rule 3.2: Team Membership Request & Approval Workflow
- Players can browse public teams and submit a membership request.
- Membership requests are governed by a dedicated workflow table (`team_membership_requests`):
  1. **Submission:** Player submits request $\rightarrow$ status = `PENDING`.
  2. **Manager Review:** Team owner/manager reviews pending requests $\rightarrow$ status = `APPROVED` or `REJECTED`.
  3. **Roster Enrollment:** Upon approval, a record is inserted into `team_members` with `status = 'ACTIVE'`.
- Managers can also invite players directly (`INVITED`), which the player can accept or decline.

### Rule 3.3: Multi-Team Participation & Invariant Protection
- Players are permitted to join multiple teams across different sports or competitions (e.g., playing for "Chama Cricket XI" and "Chama Football Club").
- **Unique Active Invariant:** A player can hold at most **one active membership per team** at any given time.
- **Historical Retention:** When a player departs a squad, the `team_members` record is marked `status = 'LEFT_TEAM'` with `left_date` populated. The record is never deleted.

---

## 5. Decision 4: Cricket Engine – Limited-Overs, Test Cricket & Super Overs

### Rule 5.1: Super Over Isolation
- When a limited-overs match ends in a tie during knockout rounds, a Super Over is conducted.
- Super Overs are modeled as distinct innings with `innings_type = 'SUPER_OVER'` and `super_over_number` (1, 2, ...).
- **Statistical Separation:** Standard match scorecard figures (batting averages, bowler economy, centuries, half-centuries) must query strictly `WHERE innings_type = 'REGULAR'`. Super Over runs and wickets are tracked independently and must never be aggregated into regular career stats.
- **Multiple Super Overs:** If a Super Over ends in a tie, subsequent Super Overs (e.g. Super Over 2) are tracked with incremented `super_over_number`.

### Rule 5.2: Ball-by-Ball Ledger & Replay Fidelity
- Deliveries are logged in `cricket_deliveries` with a strictly monotonic sequence `delivery_index` per innings.
- Captures legal status (`is_legal_delivery`), runs off bat, extras breakdown (`WIDE`, `NO_BALL`, `BYE`, `LEG_BYE`, `PENALTY`), dismissal details, and fielders.

### Rule 5.3: Auditable Scoring Corrections
- Scorers and umpires make real-time errors (e.g., miscounting a boundary, incorrect batsman recorded, DRS reversal).
- **No Silent Overwrites:** Live deliveries must never be silently edited or deleted without audit tracking.
- When an adjustment occurs:
  1. The delivery in `cricket_deliveries` is updated with `is_corrected = TRUE` and `correction_notes`.
  2. A permanent, immutable audit entry is written to `cricket_scoring_corrections` containing:
     - `delivery_id`, `innings_id`, `corrected_by_user_id`
     - `previous_delivery_data` (JSON snapshot of runs, bowler, striker, extras, wickets)
     - `corrected_delivery_data` (JSON snapshot of new values)
     - `reason` (e.g., "DRS caught behind overturned by third umpire", "Boundary signaled as 6 by square leg umpire")
     - `created_at` timestamp.
  3. Cumulative innings totals (`total_runs`, `total_wickets`, `total_overs_bowled`) are recalculated deterministically by summing the corrected delivery sequence.

---

## 6. Decision 5: Configurable Indoor Football Formats

### Rule 6.1: Format Flexibility
Indoor facilities accommodate varied football match formats. The platform **must not** assume 90-minute standard matches or 11-a-side rosters.
- Supported Formats:
  - `FIVE_A_SIDE`: Typically 5 players on pitch, 20-minute halves.
  - `SEVEN_A_SIDE`: Typically 7 players on pitch, 25-minute halves.
  - `ELEVEN_A_SIDE`: Full pitch, 45-minute halves.
  - `CUSTOM`: Configurable for youth or veteran tournaments.

### Rule 6.2: Match Attributes & Clock Governance
Every football match defines:
- `players_per_team`: Starting lineup capacity (e.g., 5, 7, 11).
- `half_duration_minutes`: Regulation half length (e.g., 20, 25, 45 mins).
- `max_substitutes`: Bench capacity.
- `extra_time_enabled`: Boolean flag indicating if tied knockout matches proceed to extra time.
- `extra_time_half_duration_minutes`: Length of extra time halves (e.g., 5 mins).
- `penalty_shootout_enabled`: Boolean flag indicating if penalty shootouts resolve ties.

### Rule 6.3: Independent Penalty Shootouts
- Penalty shootout kicks are stored in `football_penalty_kicks` (`kick_number`, `kicker_player_id`, `goalkeeper_player_id`, `is_scored`).
- Regular-time and extra-time goals remain in `football_goals`. Shootout goals are **never** mixed into regular player scoring averages.

---

## 7. Decision 6: Multi-Purpose Facilities & Parent-Child Hierarchy

### Rule 7.1: Hierarchical Facility Structure
Chama's Academy contains flexible physical spaces:
- **Parent Facility (Full Arena):** e.g., "Main Indoor Arena - Pitch A" (Full indoor pitch suitable for full-court football or indoor cricket matches).
- **Child Facilities (Sub-Divisions):** e.g., "Arena Pitch A - Net 1" and "Arena Pitch A - Net 2" (Divided batting/bowling practice nets).

### Rule 7.2: Mutual Exclusion & Availability Invariants
To prevent physical double-bookings across sub-divided spaces:
1. **Parent Locks Children:** If the Parent Arena is booked for a time interval, **neither Child Net 1 nor Child Net 2 can be booked** during that interval.
2. **Child Locks Parent:** If **either Child Net 1 OR Child Net 2** is booked, the **Parent Arena cannot be booked** during that interval.
3. **Sibling Compatibility:** Sibling child facilities (Net 1 and Net 2) **can be booked simultaneously** by different customers without conflict.

### Rule 7.3: Root-Facility Concurrency Serialization
To eliminate race conditions and deadlocks in MySQL InnoDB:
- Every child facility points to its parent via `parent_facility_id`.
- The **Root Facility ID** is defined as:
  $$\text{root\_id} = \begin{cases} \text{id} & \text{if parent\_facility\_id is NULL} \\ \text{parent\_facility\_id} & \text{if parent\_facility\_id is NOT NULL} \end{cases}$$
- **Atomic Locking Rule:** Before evaluating availability or inserting any booking, the transaction **always locks the Root Facility row** exclusively:
  ```sql
  SELECT id FROM facilities WHERE id = :rootFacilityId FOR UPDATE;
  ```
- Because any booking attempt on either the parent or any child must acquire the same root lock, all reservations across the entire facility family are strictly serialized, guaranteeing 100% collision prevention with zero deadlocks.

---

## 8. Operational Risk Mitigation & Refinement Decisions (Prompt 11)

### Rule 8.1: Payment-Review Deadlines (Preventing Indefinitely Blocked Slots)
- **Risk:** Once a customer uploads a receipt, the booking transitions to `PAYMENT_SUBMITTED`, freezing the 30-minute hold. If stadium administrators fail to review the slip promptly, the facility slot remains blocked indefinitely, potentially causing loss of revenue.
- **Enforced Invariant:**
  - A maximum **Admin Review SLA** of 24 hours from slip submission is enforced (or up to $\text{start\_time} - 2\text{ hours}$, whichever is earlier).
  - A background scheduler monitors unverified payments:
    - At $T - 4\text{ hours}$ before deadline: Automated high-priority reminder email/notification sent to all staff with `ROLE_ADMIN`.
    - At cutoff threshold ($\text{start\_time} - 2\text{ hours}$ without review): The booking is escalated to Emergency Review or automatically transitioned to `EXPIRED_UNREVIEWED` with immediate customer SMS/email alert, unblocking the slot for last-minute walk-in bookings.

### Rule 8.2: Atomic & Auditable Cricket Scoring Corrections
- **Risk:** In-game scoring corrections (e.g. boundary adjustments, DRS reversals) could lead to race conditions or inconsistent cumulative innings totals if executed concurrently.
- **Enforced Invariant:**
  - Scoring corrections are executed inside a single atomic database transaction (`@Transactional(isolation = Isolation.READ_COMMITTED)`).
  - The transaction obtains a pessimistic lock on the parent innings:
    ```sql
    SELECT id, total_runs, total_wickets FROM cricket_innings WHERE id = :inningsId FOR UPDATE;
    ```
  - An immutable audit row is inserted into `cricket_scoring_corrections` with `previous_data` and `new_data` JSON snapshots.
  - The target delivery in `cricket_deliveries` is updated with `is_corrected = TRUE`.
  - The innings cumulative totals (`total_runs`, `total_wickets`, `total_overs_bowled`) are recalculated deterministically within the same transaction by aggregating all valid deliveries in the innings.

### Rule 8.3: Strictly Single-Level Parent-Child Facility Hierarchy
- **Decision:** The facility hierarchy is strictly **single-level** (Parent $\rightarrow$ Child).
  - Top-level arena (Parent) has `parent_facility_id = NULL`.
  - Sub-divided areas (Children) have `parent_facility_id` pointing directly to the root parent.
  - Child facilities are **strictly prohibited from acting as parents to other facilities** (maximum hierarchy depth = 1).
  - This eliminates recursive tree queries, keeps root locking mathematically trivial, and avoids deadlock hazards.

### Rule 8.4: Complete Isolation of Super Over Statistics
- **Decision:** Super Overs are tracked with `innings_type = 'SUPER_OVER'` and sequential `super_over_number` (1, 2, ...).
  - Career batting averages, bowling economy rates, team net run rates (NRR), and tournament leaderboards **must strictly query `WHERE innings_type = 'REGULAR'`**.
  - Super Over statistics are stored in the same delivery schema for complete replayability, but isolated in distinct query projections.
  - Match outcome rules for tied matches progressing through Super Overs are resolved via `cricket_matches.result_type = 'WIN_BY_SUPER_OVER'`.
