-- Users
CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    email TEXT,
    password TEXT
);

-- Statements
CREATE TABLE statements (
    id SERIAL PRIMARY KEY,
    date DATE,
    merchant TEXT,
    amount REAL,
    category TEXT,
    source TEXT,
    username TEXT REFERENCES users(username) ON DELETE CASCADE,
    CONSTRAINT statement_unique UNIQUE (date, merchant, amount, category, source, username)
);
