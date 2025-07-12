-- Database initialization script
-- This script runs when the PostgreSQL container starts for the first time

-- Create development database if not exists
CREATE DATABASE IF NOT EXISTS devdb;

-- Create a test database for running tests
CREATE DATABASE IF NOT EXISTS testdb;

-- Create common schemas
\c devdb;
CREATE SCHEMA IF NOT EXISTS public;
CREATE SCHEMA IF NOT EXISTS app;

-- Create a sample table (remove this in your actual project)
CREATE TABLE IF NOT EXISTS app.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data (remove this in your actual project)
INSERT INTO app.users (email, name) VALUES 
    ('admin@example.com', 'Admin User'),
    ('dev@example.com', 'Developer User')
ON CONFLICT (email) DO NOTHING;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE devdb TO devuser;
GRANT ALL PRIVILEGES ON DATABASE testdb TO devuser;
GRANT ALL PRIVILEGES ON SCHEMA app TO devuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA app TO devuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA app TO devuser;