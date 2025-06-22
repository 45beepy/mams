const db = require('../config/db.js');

exports.getFormData = async (req, res) => {
    try {
        const assets = await db.query('SELECT asset_id, name, serial_number FROM assets ORDER BY name');
        res.json({ assets: assets.rows });
    } catch (error) {
        console.error('Error fetching purchase form data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const query = `
            SELECT am.transaction_date, a.name as asset_name, am.quantity, b.base_name as to_base, am.notes
            FROM asset_movements am
            JOIN assets a ON am.asset_id = a.asset_id
            JOIN bases b ON am.to_base_id = b.base_id
            WHERE am.movement_type = 'purchase'
            ORDER BY am.transaction_date DESC;
        `;
        const history = await db.query(query);
        res.json(history.rows);
    } catch (error) {
        console.error('Error fetching purchase history:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.createPurchase = async (req, res) => {
    const { asset_id, quantity, to_base_id, notes } = req.body;
    try {
        await db.query(
            "INSERT INTO asset_movements (asset_id, movement_type, quantity, to_base_id, notes) VALUES ($1, 'purchase', $2, $3, $4)",
            [asset_id, quantity, to_base_id, notes]
        );
        res.status(201).json({ message: 'Purchase recorded successfully' });
    } catch (error) {
        console.error('Error creating purchase:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
