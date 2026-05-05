ALTER TABLE t_p72360393_mining_game_platform.users
  ADD COLUMN IF NOT EXISTS login TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS password_hash TEXT;
