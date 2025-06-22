const db = require('../config/db.js');

// Helper function to get the base ID for a query.
// Admins can specify a base, otherwise it defaults to the user's own base.
const getQueryBaseId = (user, query) => {
    return user.role === 'Admin' && query.baseId ? query.baseId : user.baseId;
};

// Get data for form dropdowns
exports.getFormData = async (req, res) => {
    try {
        const baseId = getQueryBaseId(req.user, req.query);

        // Fetch assets currently at the relevant base that are not already assigned to someone
        const assetsQuery = `
            SELECT a.asset_id, a.name, a.serial_number FROM assets a
            LEFT JOIN (
                SELECT asset_id, MAX(transaction_date) as last_date FROM asset_movements
                WHERE movement_type = 'assignment'
                GROUP BY asset_id
            ) am ON a.asset_id = am.asset_id
            WHERE a.current_base_id = $1 AND am.asset_id IS NULL;
        `;
        const assetsResult = await db.query(assetsQuery, [baseId]);

        // Fetch personnel (users) at the relevant base
        const personnelResult = await db.query('SELECT user_id, username FROM users WHERE base_id = $1', [baseId]);

        res.json({
            assets: assetsResult.rows,
            personnel: personnelResult.rows,
        });
    } catch (error) {
        console.error('Error fetching form data for assignments:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get history of assignments and expenditures
exports.getHistory = async (req, res) => {
    try {
        const baseId = getQueryBaseId(req.user, req.query);
        const query = `
            SELECT 
                am.movement_id, 
                am.transaction_date, 
                am.movement_type, 
                am.quantity,
                a.name AS asset_name,
                u.username AS assigned_to
            FROM asset_movements am
            JOIN assets a ON am.asset_id = a.asset_id
            LEFT JOIN users u ON am.assigned_to_user_id = u.user_id
            WHERE (am.from_base_id = $1 OR a.current_base_id = $1)
            AND am.movement_type IN ('assignment', 'expenditure')
            ORDER BY am.transaction_date DESC;
        `;
        const result = await db.query(query, [baseId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching assignment history:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Create a new assignment
exports.createAssignment = async (req, res) => {
    const { asset_id, assigned_to_user_id, notes } = req.body;
    try {
        const query = `
            INSERT INTO asset_movements (asset_id, movement_type, from_base_id, assigned_to_user_id, notes)
            VALUES ($1, 'assignment', $2, $3, $4)
            RETURNING *;
        `;
        const result = await db.query(query, [asset_id, req.user.baseId, assigned_to_user_id, notes]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating assignment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Record a new expenditure
exports.createExpenditure = async (req, res) => {
    const { asset_id, quantity, notes } = req.body;
    try {
        const query = `
            INSERT INTO asset_movements (asset_id, movement_type, quantity, from_base_id, notes)
            VALUES ($1, 'expenditure', $2, $3, $4)
            RETURNING *;
        `;
        const result = await db.query(query, [asset_id, quantity, req.user.baseId, notes]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating expenditure:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};