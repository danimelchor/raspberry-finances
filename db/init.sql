-- Users
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    email TEXT,
    password TEXT
);

-- Statements
DROP TABLE IF EXISTS statements CASCADE;
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


-- Hidden
DROP TABLE IF EXISTS hidden CASCADE;
CREATE TABLE IF NOT EXISTS hidden (
    merchant TEXT,
    username TEXT REFERENCES users(username) ON DELETE CASCADE,
    CONSTRAINT hidden_unique UNIQUE (merchant, username)
);

-- Renames
DROP TABLE IF EXISTS renames CASCADE;
CREATE TABLE IF NOT EXISTS renames (
    original_merchant TEXT PRIMARY KEY,
    new_merchant TEXT,
    username TEXT REFERENCES users(username) ON DELETE CASCADE,
    CONSTRAINT rename_unique UNIQUE (original_merchant, username)
);

-- Categories
DROP TABLE IF EXISTS categories CASCADE;
CREATE TABLE IF NOT EXISTS categories (
    merchant TEXT PRIMARY KEY,
    category TEXT,
    username TEXT REFERENCES users(username) ON DELETE CASCADE,
    CONSTRAINT category_unique UNIQUE (merchant, username)
);
