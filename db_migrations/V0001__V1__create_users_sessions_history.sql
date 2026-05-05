
CREATE TABLE IF NOT EXISTS t_p72360393_mining_game_platform.users (
    id SERIAL PRIMARY KEY,
    tg_id BIGINT UNIQUE NOT NULL,
    tg_username TEXT,
    tg_first_name TEXT,
    name TEXT NOT NULL,
    balance NUMERIC(12,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p72360393_mining_game_platform.sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES t_p72360393_mining_game_platform.users(id),
    token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
);

CREATE TABLE IF NOT EXISTS t_p72360393_mining_game_platform.tg_codes (
    id SERIAL PRIMARY KEY,
    tg_id BIGINT NOT NULL,
    tg_username TEXT,
    tg_first_name TEXT,
    code TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '10 minutes'
);

CREATE TABLE IF NOT EXISTS t_p72360393_mining_game_platform.game_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES t_p72360393_mining_game_platform.users(id),
    type TEXT NOT NULL,
    label TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
