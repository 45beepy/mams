const db = require('../config/db.js');
const bcrypt = require('bcryptjs');

exports.seedDatabase = async (req, res) => {
    try {
        const passwordHash = await bcrypt.hash('password123', 10);

     
        await db.query(`
            DROP TABLE IF EXISTS asset_movements, assets, users, roles, bases, equipment_types CASCADE;
            DROP TYPE IF EXISTS movement_type;
        `);

       
        await db.query(`
            CREATE TYPE movement_type AS ENUM ('purchase', 'transfer_in', 'transfer_out', 'assignment', 'expenditure', 'initial_stock');
            CREATE TABLE roles ( role_id SERIAL PRIMARY KEY, role_name VARCHAR(50) UNIQUE NOT NULL );
            CREATE TABLE bases ( base_id SERIAL PRIMARY KEY, base_name VARCHAR(100) NOT NULL, location VARCHAR(255) );
            CREATE TABLE equipment_types ( type_id SERIAL PRIMARY KEY, type_name VARCHAR(100) UNIQUE NOT NULL );
            CREATE TABLE users ( user_id SERIAL PRIMARY KEY, username VARCHAR(50) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, role_id INT NOT NULL REFERENCES roles(role_id), base_id INT REFERENCES bases(base_id) );
            CREATE TABLE assets ( asset_id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, serial_number VARCHAR(100) UNIQUE, type_id INT NOT NULL REFERENCES equipment_types(type_id), current_base_id INT REFERENCES bases(base_id) );
            CREATE TABLE asset_movements ( movement_id SERIAL PRIMARY KEY, asset_id INT NOT NULL REFERENCES assets(asset_id), movement_type movement_type NOT NULL, quantity INT NOT NULL DEFAULT 1, from_base_id INT REFERENCES bases(base_id), to_base_id INT REFERENCES bases(base_id), assigned_to_user_id INT REFERENCES users(user_id), transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(), notes TEXT );
        `);
        
        // Seed initial data
        await db.query(`
            INSERT INTO roles (role_name) VALUES ('Admin'), ('Base Commander'), ('Logistics Officer');
            INSERT INTO bases (base_name, location) VALUES ('Fort Courage', 'West Region'), ('Camp Victory', 'East Region'), ('Eagle Base', 'Central Command');
            INSERT INTO equipment_types (type_name) VALUES ('Vehicle'), ('Weapon'), ('Ammunition'), ('Communications');
        `);
        
        await db.query(
            `INSERT INTO users (username, password_hash, role_id, base_id) VALUES
             ('admin_user', $1, 1, NULL),
             ('commander_west', $1, 2, 1),
             ('logistics_east', $1, 3, 2)`,
            [passwordHash]
        );

        await db.query(`
            INSERT INTO assets (name, serial_number, type_id, current_base_id) VALUES
            ('Humvee', 'HMV-001', 1, 1),
            ('M4 Carbine', 'M4-101', 2, 1),
            ('M4 Carbine', 'M4-102', 2, 2),
            ('5.56mm Rounds', NULL, 3, 1),
            ('Satellite Phone', 'SAT-50', 4, 2);
        `);
        
        
        await db.query(`
            INSERT INTO asset_movements (asset_id, movement_type, quantity, to_base_id, transaction_date) VALUES
            (1, 'initial_stock', 1, 1, NOW() - INTERVAL '20 day'),
            (2, 'initial_stock', 1, 1, NOW() - INTERVAL '20 day'),
            (3, 'initial_stock', 1, 2, NOW() - INTERVAL '20 day'),
            (4, 'initial_stock', 5000, 1, NOW() - INTERVAL '20 day'),
            (5, 'initial_stock', 1, 2, NOW() - INTERVAL '20 day');

            INSERT INTO asset_movements (asset_id, movement_type, quantity, to_base_id, transaction_date, notes) VALUES
            (2, 'purchase', 5, 1, NOW() - INTERVAL '15 day', 'New batch of rifles');

            INSERT INTO asset_movements (asset_id, movement_type, quantity, from_base_id, to_base_id, transaction_date, notes) VALUES
            (2, 'transfer_out', 1, 1, 2, NOW() - INTERVAL '10 day', 'Transfer M4-101 to Camp Victory');
            
            INSERT INTO asset_movements (asset_id, movement_type, quantity, from_base_id, to_base_id, transaction_date, notes) VALUES
            (2, 'transfer_in', 1, 1, 2, NOW() - INTERVAL '9 day', 'Received M4-101 from Fort Courage');

            INSERT INTO asset_movements (asset_id, movement_type, quantity, from_base_id, transaction_date, notes) VALUES
            (4, 'expenditure', 300, 1, NOW() - INTERVAL '5 day', 'Training exercise usage');
        `);

        res.status(200).send('Database seeded successfully with current dates! You can now log in.');
    } catch (error) {
        console.error('Error seeding database:', error);
        res.status(500).send('Failed to seed database. Check server logs.');
    }
};
