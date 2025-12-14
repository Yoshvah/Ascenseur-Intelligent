-- Simplified database for elevator simulation
-- Run: psql -U postgres -d elevator_simulation -f database.sql

-- Create database (run this separately if needed)
-- CREATE DATABASE elevator_simulation;

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS elevator_logs (
    id SERIAL PRIMARY KEY,
    elevator_id INTEGER NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    floor INTEGER,
    passengers INTEGER,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS elevator_calls (
    id SERIAL PRIMARY KEY,
    floor INTEGER NOT NULL,
    direction VARCHAR(10) NOT NULL,
    passengers INTEGER DEFAULT 1,
    destination INTEGER,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_elevator_logs_created_at ON elevator_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_elevator_calls_status ON elevator_calls(status);

-- View data
SELECT * FROM elevator_calls ORDER BY created_at DESC;
SELECT * FROM elevator_logs ORDER BY created_at DESC LIMIT 10;