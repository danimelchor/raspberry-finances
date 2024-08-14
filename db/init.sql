CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
    source TEXT,
    username TEXT REFERENCES users(username) ON DELETE CASCADE,
    CONSTRAINT statement_unique UNIQUE (date, merchant, amount, source, username)
);

-- Categories
DROP TABLE IF EXISTS categories CASCADE;
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    merchant TEXT,
    category TEXT,
    username TEXT REFERENCES users(username) ON DELETE CASCADE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT category_unique UNIQUE (merchant, username)
);
CREATE TRIGGER categories_update_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();


-- Hidden
DROP TABLE IF EXISTS hidden CASCADE;
CREATE TABLE IF NOT EXISTS hidden (
    id SERIAL PRIMARY KEY,
    merchant TEXT,
    username TEXT REFERENCES users(username) ON DELETE CASCADE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT hidden_unique UNIQUE (merchant, username)
);
CREATE TRIGGER hidden_update_updated_at
    BEFORE UPDATE ON hidden
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Renames
DROP TABLE IF EXISTS renames CASCADE;
CREATE TABLE IF NOT EXISTS renames (
    id SERIAL PRIMARY KEY,
    original_merchant TEXT,
    new_merchant TEXT,
    username TEXT REFERENCES users(username) ON DELETE CASCADE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT rename_unique UNIQUE (original_merchant, username)
);
CREATE TRIGGER renames_update_updated_at
    BEFORE UPDATE ON renames
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
