-- =============================================================================
-- AURELIA FC — create the least-privilege application database user and
-- optionally seed an administrator account.
-- -----------------------------------------------------------------------------
-- Run once, as a MySQL administrator:
--   mysql -u root -p -e "source database/03_create_admin.sql"
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Application database user (used by the ASP.NET Core API connection string)
--    Replace CHANGE_ME with a strong password and keep it out of source control
--    (use env vars:  ConnectionStrings__Aurelia  or  dotnet user-secrets).
-- ---------------------------------------------------------------------------
CREATE USER IF NOT EXISTS 'aurelia_app'@'localhost' IDENTIFIED BY 'CHANGE_ME';
CREATE USER IF NOT EXISTS 'aurelia_app'@'127.0.0.1' IDENTIFIED BY 'CHANGE_ME';

GRANT SELECT, INSERT, UPDATE, DELETE
  ON aurelia_fc.* TO 'aurelia_app'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE
  ON aurelia_fc.* TO 'aurelia_app'@'127.0.0.1';

FLUSH PRIVILEGES;

-- ---------------------------------------------------------------------------
-- 2. Administrator account (optional).
--
--    A BCrypt hash cannot be authored by hand. Generate one with the helper
--    command shipped in the API:
--
--        dotnet run --project backend/AureliaFc.Api -- hash "YourStrongPassword"
--
--    Copy the printed hash into the statement below (and change the email),
--    then run it. The account is created with role = 'Admin'.
-- ---------------------------------------------------------------------------
-- USE aurelia_fc;
-- INSERT INTO users (first_name, last_name, email, password_hash, role)
-- VALUES (
--   'Arthur',
--   'Sterling',
--   'admin@aureliafc.com',
--   '<paste-bcrypt-hash-here>',
--   'Admin'
-- )
-- ON DUPLICATE KEY UPDATE role = 'Admin';
