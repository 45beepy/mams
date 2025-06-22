const db = require('../config/db.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { username, password } = req.body;
    
    // --- START DEBUG LOGGING ---
    console.log(`\n--- Login Attempt for user: ${username} ---`);
    console.log(`Received password: ${password}`);
    // --- END DEBUG LOGGING ---

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const result = await db.query(
            `SELECT u.user_id, u.username, u.password_hash, r.role_name, u.base_id
             FROM users u
             JOIN roles r ON u.role_id = r.role_id
             WHERE u.username = $1`,
            [username]
        );

        if (result.rows.length === 0) {
            // --- START DEBUG LOGGING ---
            console.log('Login Failure: User not found in database.');
            // --- END DEBUG LOGGING ---
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = result.rows[0];
        // --- START DEBUG LOGGING ---
        console.log(`User found: ${user.username}`);
        console.log(`Stored hash: ${user.password_hash}`);
        // --- END DEBUG LOGGING ---
        
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        // --- START DEBUG LOGGING ---
        console.log(`Password comparison result (isPasswordValid): ${isPasswordValid}`);
        // --- END DEBUG LOGGING ---

        if (!isPasswordValid) {
            // --- START DEBUG LOGGING ---
            console.log('Login Failure: Password does not match.');
            // --- END DEBUG LOGGING ---
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // --- START DEBUG LOGGING ---
        console.log('Login Success: Password matches. Generating token.');
        // --- END DEBUG LOGGING ---

        const token = jwt.sign(
            {
                userId: user.user_id,
                role: user.role_name,
                baseId: user.base_id,
                username: user.username,
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            token,
            user: {
                userId: user.user_id,
                username: user.username,
                role: user.role_name,
                baseId: user.base_id,
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};