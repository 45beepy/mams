const db = require('../config/db.js');

exports.getFormData = async (req, res) => {
    try {
   
        const assets = await db.query('SELECT asset_id, name, serial_number FROM assets WHERE current_base_id = $1 ORDER BY name', [req.user.baseId]);
       
        const bases = await db.query('SELECT base_id, base_name FROM bases WHERE base_id != $1 ORDER BY base_name', [req.user.baseId]);
        res.json({ assets: assets.rows, bases: bases.rows });
    } catch (error) {
        console.error('Error fetching transfer form data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const query = `
            SELECT am.transaction_date, a.name as asset_name, am.quantity, fb.base_name as from_base, tb.base_name as to_base, am.notes
            FROM asset_movements am
            JOIN assets a ON am.asset_id = a.asset_id
            LEFT JOIN bases fb ON am.from_base_id = fb.base_id
            LEFT JOIN bases tb ON am.to_base_id = tb.base_id
            WHERE am.movement_type IN ('transfer_in', 'transfer_out')
            ORDER BY am.transaction_date DESC;
        `;
        const history = await db.query(query);
        res.json(history.rows);
    } catch (error) {
        console.error('Error fetching transfer history:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.createTransfer = async (req, res) => {
    const { asset_id, to_base_id, quantity, notes } = req.body;
    const from_base_id = req.user.baseId;
    const client = await db.getClient();

    try {
        await client.query('BEGIN');

  
        await client.query(
            "INSERT INTO asset_movements (asset_id, movement_type, quantity, from_base_id, to_base_id, notes) VALUES ($1, 'transfer_out', $2, $3, $4, $5)",
            [asset_id, quantity, from_base_id, to_base_id, notes]
        );

     
        await client.query(
            "INSERT INTO asset_movements (asset_id, movement_type, quantity, from_base_id, to_base_id, notes) VALUES ($1, 'transfer_in', $2, $3, $4, $5)",
            [asset_id, quantity, from_base_id, to_base_id, notes]
        );

      
        await client.query('UPDATE assets SET current_base_id = $1 WHERE asset_id = $2', [to_base_id, asset_id]);

        await client.query('COMMIT');
        res.status(201).json({ message: 'Transfer completed successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating transfer:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        client.release();
    }
};
