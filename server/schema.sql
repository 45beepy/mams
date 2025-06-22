-- Drop tables if they exist to start fresh
DROP TABLE IF EXISTS asset_movements, assets, users, roles, bases, equipment_types CASCADE;

-- Create ENUM types for controlled vocabularies
CREATE TYPE movement_type AS ENUM ('purchase', 'transfer_in', 'transfer_out', 'assignment', 'expenditure', 'initial_stock');

-- Table for Roles
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
);

-- Table for Bases
CREATE TABLE bases (
    base_id SERIAL PRIMARY KEY,
    base_name VARCHAR(100) NOT NULL,
    location VARCHAR(255)
);

-- Table for Equipment Types
CREATE TABLE equipment_types (
    type_id SERIAL PRIMARY KEY,
    type_name VARCHAR(100) UNIQUE NOT NULL
);

-- Table for Users
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL REFERENCES roles(role_id),
    base_id INT REFERENCES bases(base_id) -- Nullable for Admin
);

-- Table for Assets
CREATE TABLE assets (
    asset_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) UNIQUE, -- Can be null for bulk items like ammo
    type_id INT NOT NULL REFERENCES equipment_types(type_id),
    current_base_id INT REFERENCES bases(base_id) -- Tracks the asset's current location
);

-- Core Table for all Asset Movements and Transactions
CREATE TABLE asset_movements (
    movement_id SERIAL PRIMARY KEY,
    asset_id INT NOT NULL REFERENCES assets(asset_id),
    movement_type movement_type NOT NULL,
    quantity INT NOT NULL DEFAULT 1, -- For countable items, especially ammo
    from_base_id INT REFERENCES bases(base_id),
    to_base_id INT REFERENCES bases(base_id),
    assigned_to_user_id INT REFERENCES users(user_id),
    transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT
);

-- SEED DATA --

-- Seed Roles
INSERT INTO roles (role_name) VALUES ('Admin'), ('Base Commander'), ('Logistics Officer');

-- Seed Bases
INSERT INTO bases (base_name, location) VALUES
('Fort Courage', 'West Region'),
('Camp Victory', 'East Region'),
('Eagle Base', 'Central Command');

-- Seed Equipment Types
INSERT INTO equipment_types (type_name) VALUES ('Vehicle'), ('Weapon'), ('Ammunition'), ('Communications');

-- Seed Users (passwords are all 'password123' hashed)
-- Use a bcrypt calculator to generate these hashes for real use
INSERT INTO users (username, password_hash, role_id, base_id) VALUES
('admin_user', '$2b$10$fWpqbN3CgYdJtX./SwI2pO1sY9jZ/C3CbxSgNsgc8Zq.Kk2YwY9yS', 1, NULL),
('commander_west', '$2b$10$fWpqbN3CgYdJtX./SwI2pO1sY9jZ/C3CbxSgNsgc8Zq.Kk2YwY9yS', 2, 1),
('logistics_east', '$2b$10$fWpqbN3CgYdJtX./SwI2pO1sY9jZ/C3CbxSgNsgc8Zq.Kk2YwY9yS', 3, 2);

-- Seed some Assets
INSERT INTO assets (name, serial_number, type_id, current_base_id) VALUES
('Humvee', 'HMV-001', 1, 1),
('M4 Carbine', 'M4-101', 2, 1),
('M4 Carbine', 'M4-102', 2, 2),
('5.56mm Rounds', NULL, 3, 1),
('Satellite Phone', 'SAT-50', 4, 2);

-- Seed some Initial Stock Movements
INSERT INTO asset_movements (asset_id, movement_type, quantity, to_base_id, transaction_date) VALUES
(1, 'initial_stock', 1, 1, '2023-01-01 10:00:00Z'), -- Humvee at Fort Courage
(2, 'initial_stock', 1, 1, '2023-01-01 10:00:00Z'), -- M4 at Fort Courage
(3, 'initial_stock', 1, 2, '2023-01-01 10:00:00Z'), -- M4 at Camp Victory
(4, 'initial_stock', 5000, 1, '2023-01-01 10:00:00Z'), -- Ammo at Fort Courage
(5, 'initial_stock', 1, 2, '2023-01-01 10:00:00Z'); -- Sat Phone at Camp Victory

-- Example Purchase
INSERT INTO asset_movements (asset_id, movement_type, quantity, to_base_id, transaction_date, notes) VALUES
(2, 'purchase', 5, 1, '2023-02-15 14:30:00Z', 'New batch of rifles');

-- Example Transfer
-- 1. Transfer Out from Fort Courage
INSERT INTO asset_movements (asset_id, movement_type, quantity, from_base_id, to_base_id, transaction_date, notes) VALUES
(2, 'transfer_out', 1, 1, 2, '2023-03-10 09:00:00Z', 'Transfer M4-101 to Camp Victory');
-- 2. Transfer In to Camp Victory
INSERT INTO asset_movements (asset_id, movement_type, quantity, from_base_id, to_base_id, transaction_date, notes) VALUES
(2, 'transfer_in', 1, 1, 2, '2023-03-10 09:05:00Z', 'Received M4-101 from Fort Courage');
-- NOTE: In a real app, the transfer API call would create both these records in a single transaction.

-- Example Expenditure
INSERT INTO asset_movements (asset_id, movement_type, quantity, from_base_id, transaction_date, notes) VALUES
(4, 'expenditure', 300, 1, '2023-04-01 11:00:00Z', 'Training exercise usage');
