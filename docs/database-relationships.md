# Chama's Academy – Database Entity Relationships & Integrity Design (Final)

This document formalizes the entity-relationship architecture, foreign key constraints, cascade rules, and Mermaid ER diagrams for the **29 tables** in the Chama's Academy database.

---

## 1. High-Level Modular Entity Architecture

```mermaid
flowchart TD
    subgraph Core ["1. Core Identity & Facilities"]
        Users["users"]
        Roles["roles"]
        Facilities["facilities (Parent-Child)"]
    end

    subgraph BookingsModule ["2. Bookings & Payments"]
        Bookings["bookings (30m Hold & Offline Refund)"]
        Payments["booking_payments (Secure File Metadata)"]
    end

    subgraph TeamsModule ["3. Teams, Players & Membership"]
        Players["players"]
        Teams["teams"]
        TeamMembers["team_members (Active & History)"]
        MembershipReqs["team_membership_requests (Workflow)"]
    end

    subgraph CricketEngine ["4. Cricket Scoring Engine"]
        CricMatches["cricket_matches"]
        CricInnings["cricket_innings (Regular & Super Overs)"]
        CricDeliveries["cricket_deliveries (Ball-by-Ball)"]
        CricCorrections["cricket_scoring_corrections (Audit)"]
        CricOfficials["cricket_match_officials"]
        CricLineups["cricket_match_lineups"]
    end

    subgraph FootballEngine ["5. Football Match Engine"]
        FootMatches["football_matches (Configurable Formats)"]
        FootGoals["football_goals"]
        FootCards["football_cards"]
        FootSubs["football_substitutions"]
        FootShootouts["football_penalty_kicks (Shootouts)"]
        FootOfficials["football_match_officials"]
        FootLineups["football_match_lineups"]
    end

    subgraph TournamentsModule ["6. Tournaments & Leagues"]
        Tournaments["tournaments"]
        TournamentTeams["tournament_teams"]
        Stages["tournament_stages"]
        Fixtures["tournament_fixtures"]
        Standings["league_standings (Points, GD, NRR)"]
    end

    Users --> Bookings
    Facilities --> Bookings
    Bookings --> Payments

    Users --> Players
    Users --> Teams
    Players --> Teams
    Teams --> TeamMembers
    Players --> TeamMembers
    Players --> MembershipReqs
    Teams --> MembershipReqs

    Tournaments --> TournamentTeams
    Tournaments --> Stages
    Stages --> Fixtures
    Stages --> Standings
    Teams --> TournamentTeams

    Fixtures -.-> CricMatches
    Fixtures -.-> FootMatches

    CricMatches --> CricInnings
    CricInnings --> CricDeliveries
    CricDeliveries --> CricCorrections
    CricMatches --> CricOfficials
    CricMatches --> CricLineups

    FootMatches --> FootGoals
    FootMatches --> FootCards
    FootMatches --> FootSubs
    FootMatches --> FootShootouts
    FootMatches --> FootOfficials
    FootMatches --> FootLineups
```

---

## 2. Module 1: Core Identity, Facilities & Bookings

### Entity Relationship Diagram
```mermaid
erDiagram
    users ||--o{ user_roles : "has"
    roles ||--o{ user_roles : "assigned to"
    facilities ||--o{ facilities : "subdivided into"
    users ||--o{ bookings : "reserves"
    facilities ||--o{ bookings : "allocated for"
    bookings ||--|| booking_payments : "verified by"
    users ||--o{ booking_payments : "audited by"
    users ||--o{ bookings : "cancelled by"
    users ||--o{ audit_logs : "performed by"

    users {
        bigint id PK
        varchar email UK
        varchar password_hash
        varchar first_name
        varchar last_name
        varchar phone_number
        varchar status
    }

    roles {
        bigint id PK
        varchar name UK
        varchar description
    }

    user_roles {
        bigint user_id PK,FK
        bigint role_id PK,FK
        timestamp assigned_at
    }

    facilities {
        bigint id PK
        bigint parent_facility_id FK
        varchar name UK
        varchar sport_type
        decimal hourly_rate
        int min_booking_hours
        varchar status
    }

    bookings {
        bigint id PK
        varchar booking_reference UK
        bigint user_id FK
        bigint facility_id FK
        datetime start_time
        datetime end_time
        varchar status
        datetime hold_expires_at
        datetime cancelled_at
        bigint cancelled_by_user_id FK
        varchar refund_status
    }

    booking_payments {
        bigint id PK
        bigint booking_id UK,FK
        varchar payment_method
        varchar storage_key
        varchar file_name
        decimal amount_paid
        varchar verification_status
        bigint verified_by_user_id FK
        datetime verified_at
    }
```

---

## 3. Module 2: Teams, Players & Membership Governance

### Entity Relationship Diagram
```mermaid
erDiagram
    users ||--o| players : "profile of"
    users ||--o{ teams : "manages/owns"
    players ||--o{ teams : "captains"
    teams ||--o{ team_members : "enrolls"
    players ||--o{ team_members : "member of"
    players ||--o{ team_membership_requests : "submits"
    teams ||--o{ team_membership_requests : "receives"
    users ||--o{ team_membership_requests : "approved by"

    players {
        bigint id PK
        bigint user_id UK,FK
        varchar first_name
        varchar last_name
        varchar cricket_batting_style
        varchar cricket_bowling_style
        varchar football_preferred_position
    }

    teams {
        bigint id PK
        varchar name
        varchar sport_type
        bigint manager_user_id FK
        bigint captain_player_id FK
        bigint vice_captain_player_id FK
        varchar status
    }

    team_members {
        bigint id PK
        bigint team_id FK
        bigint player_id FK
        int jersey_number
        varchar role_in_team
        varchar status
        date joined_date
        date left_date
    }

    team_membership_requests {
        bigint id PK
        bigint team_id FK
        bigint player_id FK
        varchar request_type
        varchar status
        bigint responded_by_user_id FK
        datetime responded_at
    }
```

---

## 4. Module 3: Cricket Scoring Engine (With Super Overs & Corrections)

### Entity Relationship Diagram
```mermaid
erDiagram
    teams ||--o{ cricket_matches : "team 1"
    teams ||--o{ cricket_matches : "team 2"
    cricket_matches ||--o{ cricket_match_officials : "umpired by"
    cricket_matches ||--o{ cricket_match_lineups : "lineups"
    cricket_matches ||--o{ cricket_innings : "contains"
    cricket_innings ||--o{ cricket_deliveries : "recorded in"
    cricket_deliveries ||--o{ cricket_scoring_corrections : "amended by"
    users ||--o{ cricket_scoring_corrections : "corrected by"

    cricket_matches {
        bigint id PK
        varchar match_code UK
        varchar match_type
        int overs_limit
        boolean super_overs_allowed
        datetime scheduled_start_time
        bigint team1_id FK
        bigint team2_id FK
        varchar status
        bigint winner_team_id FK
        varchar result_type
    }

    cricket_innings {
        bigint id PK
        bigint match_id FK
        int innings_number
        varchar innings_type
        int super_over_number
        bigint batting_team_id FK
        bigint bowling_team_id FK
        boolean is_declared
        boolean is_follow_on
        int total_runs
        int total_wickets
        decimal total_overs_bowled
    }

    cricket_deliveries {
        bigint id PK
        bigint innings_id FK
        int over_number
        int ball_number
        int delivery_index
        boolean is_legal_delivery
        bigint bowler_player_id FK
        bigint striker_player_id FK
        int runs_off_bat
        int extras_runs
        varchar extra_type
        boolean is_wicket
        varchar dismissal_type
        boolean is_corrected
    }

    cricket_scoring_corrections {
        bigint id PK
        bigint delivery_id FK
        bigint innings_id FK
        bigint corrected_by_user_id FK
        json previous_data
        json new_data
        varchar reason
        timestamp created_at
    }
```

---

## 5. Module 4: Football Match Engine (Configurable Formats & Shootouts)

### Entity Relationship Diagram
```mermaid
erDiagram
    teams ||--o{ football_matches : "home team"
    teams ||--o{ football_matches : "away team"
    football_matches ||--o{ football_match_officials : "refereed by"
    football_matches ||--o{ football_match_lineups : "lineups"
    football_matches ||--o{ football_goals : "goals"
    football_matches ||--o{ football_cards : "cards"
    football_matches ||--o{ football_substitutions : "subs"
    football_matches ||--o{ football_penalty_kicks : "shootout kicks"

    football_matches {
        bigint id PK
        varchar match_code UK
        varchar format
        int half_duration_minutes
        int players_per_team
        boolean extra_time_enabled
        boolean penalty_shootout_enabled
        bigint home_team_id FK
        bigint away_team_id FK
        int home_score
        int away_score
        int home_penalty_score
        int away_penalty_score
        varchar status
    }

    football_goals {
        bigint id PK
        bigint match_id FK
        bigint team_id FK
        bigint scorer_player_id FK
        bigint assist_player_id FK
        int minute
        varchar goal_type
    }

    football_cards {
        bigint id PK
        bigint match_id FK
        bigint team_id FK
        bigint player_id FK
        int minute
        varchar card_type
        varchar reason
    }

    football_substitutions {
        bigint id PK
        bigint match_id FK
        bigint team_id FK
        bigint player_off_id FK
        bigint player_on_id FK
        int minute
    }

    football_penalty_kicks {
        bigint id PK
        bigint match_id FK
        bigint team_id FK
        bigint kicker_player_id FK
        bigint goalkeeper_player_id FK
        int kick_number
        boolean is_scored
    }
```

---

## 6. Module 5: Tournaments, Leagues & Standings

### Entity Relationship Diagram
```mermaid
erDiagram
    tournaments ||--o{ tournament_teams : "registers"
    teams ||--o{ tournament_teams : "enrolled in"
    tournaments ||--o{ tournament_stages : "stages"
    tournament_stages ||--o{ tournament_fixtures : "fixtures"
    tournament_stages ||--o{ league_standings : "standings"
    teams ||--o{ league_standings : "ranked in"
    cricket_matches ||--o| tournament_fixtures : "cricket match"
    football_matches ||--o| tournament_fixtures : "football match"

    tournaments {
        bigint id PK
        varchar name
        varchar sport_type
        varchar format
        date start_date
        date end_date
        varchar status
    }

    tournament_teams {
        bigint id PK
        bigint tournament_id FK
        bigint team_id FK
        varchar status
        int seed_number
        varchar group_name
    }

    tournament_stages {
        bigint id PK
        bigint tournament_id FK
        varchar stage_name
        varchar stage_type
        int stage_order
    }

    tournament_fixtures {
        bigint id PK
        bigint tournament_id FK
        bigint stage_id FK
        varchar sport_type
        bigint cricket_match_id UK,FK
        bigint football_match_id UK,FK
        bigint team1_id FK
        bigint team2_id FK
        int fixture_number
        datetime scheduled_time
        varchar status
    }

    league_standings {
        bigint id PK
        bigint tournament_id FK
        bigint stage_id FK
        bigint team_id FK
        int played
        int won
        int drawn
        int lost
        int points
        int goal_difference
        decimal net_run_rate
        int rank_position
    }
```

---

## 7. Complete Referential Integrity & Cascade Strategy Matrix

| Parent Table | Child Table | Foreign Key Column | Action on Delete | Architectural Justification |
| :--- | :--- | :--- | :--- | :--- |
| `facilities` | `facilities` | `parent_facility_id` | `RESTRICT` | Parent facility cannot be deleted if sub-facilities exist. |
| `users` | `bookings` | `user_id` | `RESTRICT` | Financial auditability; users with bookings cannot be purged from DB. |
| `facilities` | `bookings` | `facility_id` | `RESTRICT` | Facilities with reservations cannot be deleted. |
| `bookings` | `booking_payments`| `booking_id` | `CASCADE` | Purging an unconfirmed draft booking deletes its payment metadata. |
| `users` | `booking_payments`| `verified_by_user_id`| `SET NULL`| Deleting an admin user preserves the audit history. |
| `users` | `players` | `user_id` | `SET NULL` | Unlinking a user account preserves the player's match history. |
| `teams` | `team_members` | `team_id` | `CASCADE` | Disbanding a team removes roster links. |
| `players` | `team_members` | `player_id` | `CASCADE` | Removing player removes active squad links. |
| `teams` | `team_membership_requests`| `team_id`| `CASCADE`| Disbanding team purges pending requests. |
| `cricket_matches` | `cricket_innings` | `match_id` | `CASCADE` | Deleting match deletes innings and child deliveries. |
| `cricket_innings` | `cricket_deliveries`| `innings_id` | `CASCADE` | Deleting innings deletes delivery log. |
| `cricket_deliveries`| `cricket_scoring_corrections`| `delivery_id`| `CASCADE`| Deleting delivery deletes its correction log. |
| `football_matches`| `football_goals` | `match_id` | `CASCADE` | Match deletion cleans up goals. |
| `football_matches`| `football_penalty_kicks`| `match_id`| `CASCADE`| Match deletion cleans up shootout kicks. |
| `tournaments` | `tournament_stages`| `tournament_id` | `CASCADE` | Tournament deletion cleans up stages and fixtures. |
| `tournaments` | `cricket_matches` | `tournament_id` | `SET NULL` | Deleting tournament converts matches to stand-alone friendlies. |
| `tournaments` | `football_matches`| `tournament_id` | `SET NULL` | Deleting tournament converts matches to stand-alone friendlies. |
