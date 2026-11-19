-- ==============================================================================
-- Chama's Academy - Flyway Migration V2: Idempotent System Role Seeding
-- Target: MySQL 8.0.46 (InnoDB)
-- ==============================================================================

-- Safe, idempotent insertion of approved system roles
-- Avoids duplicate key errors and does not overwrite administrator modifications
INSERT IGNORE INTO roles (name, description) VALUES
    ('ROLE_CUSTOMER', 'Registered stadium customer booking facilities and joining teams'),
    ('ROLE_ADMIN', 'Stadium management administrator with approval and override rights'),
    ('ROLE_UMPIRE', 'Certified cricket match umpire and scorer'),
    ('ROLE_REFEREE', 'Certified football match referee and linesman'),
    ('ROLE_STAFF', 'Stadium operational staff and scorekeeper');
