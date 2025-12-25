-- Create the translations database and schema
-- Run with: psql -U ab -f create_translations_db.sql

-- Connect to postgres to create the database
\c postgres

-- Create the database (will fail if it already exists)
CREATE DATABASE translations;

-- Connect to the new database
\c translations

-- Create users table
CREATE TABLE users (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    email text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create sessions table
CREATE TABLE sessions (
    id text NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at timestamp with time zone NOT NULL
);

-- Create translations table
CREATE TABLE translations (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_lang text NOT NULL,
    original_text text NOT NULL,
    original_reading text,
    translation_lang text NOT NULL,
    translation_text text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
