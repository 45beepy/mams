const db = require('../config/db.js');


const buildWhereClause = (user, queryParams) => {
    let whereClauses = ["1=1"]; 
    let params = [];
    let paramIndex = 1;

 
    if (user.role === 'Base Commander' || user.role === 'Logistics Officer') {
        whereClauses.push(`(am.to_base_id = $${paramIndex} OR am.from_base_id = $${paramIndex})`);
        params.push(user.baseId);
        paramIndex++;
    }

    if (user.role === 'Admin' && queryParams.baseId) {
        whereClauses.push(`(am.to_base_id = $${paramIndex} OR am.from_base_id = $${paramIndex})`);
        params.push(queryParams.baseId);
        paramIndex++;
    }

    if (queryParams.equipmentTypeId) {
        whereClauses.push(`a.type_id = $${paramIndex}`);
        params.push(queryParams.equipmentTypeId);
        paramIndex++;
    }
    
    return {
        clause: whereClauses.join(" AND "),
        params: params,
        paramIndex: paramIndex
    };
};

exports.getMetrics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const { clause, params, paramIndex } = buildWhereClause(req.user, req.query);

        const openingBalanceQuery = `
            SELECT COALESCE(SUM(
                CASE
                    WHEN am.movement_type IN ('purchase', 'transfer_in', 'initial_stock') THEN am.quantity
                    WHEN am.movement_type IN ('transfer_out', 'expenditure', 'assignment') THEN -am.quantity
                    ELSE 0
                END
            ), 0) AS balance
            FROM asset_movements am
            JOIN assets a ON am.asset_id = a.asset_id
            WHERE ${clause} AND am.transaction_date < $${paramIndex};
        `;
        const openingResult = await db.query(openingBalanceQuery, [...params, startDate]);
        const openingBalance = parseInt(openingResult.rows[0].balance, 10);

        
        const movementsQuery = `
            SELECT
                SUM(CASE WHEN am.movement_type = 'purchase' THEN am.quantity ELSE 0 END) AS purchases,
                SUM(CASE WHEN am.movement_type = 'transfer_in' THEN am.quantity ELSE 0 END) AS transfers_in,
                SUM(CASE WHEN am.movement_type = 'transfer_out' THEN am.quantity ELSE 0 END) AS transfers_out,
                SUM(CASE WHEN am.movement_type = 'expenditure' THEN am.quantity ELSE 0 END) AS expended,
                SUM(CASE WHEN am.movement_type = 'assignment' THEN am.quantity ELSE 0 END) AS assigned
            FROM asset_movements am
            JOIN assets a ON am.asset_id = a.asset_id
            WHERE ${clause} AND am.transaction_date >= $${paramIndex} AND am.transaction_date <= $${paramIndex + 1};
        `;
        const movementsResult = await db.query(movementsQuery, [...params, startDate, endDate]);
        const movements = movementsResult.rows[0];

        const purchases = parseInt(movements.purchases, 10);
        const transfersIn = parseInt(movements.transfers_in, 10);
        const transfersOut = parseInt(movements.transfers_out, 10);
        const expended = parseInt(movements.expended, 10);
        const assigned = parseInt(movements.assigned, 10);

        const netMovement = purchases + transfersIn - transfersOut;
        const closingBalance = openingBalance + netMovement - expended - assigned;

        res.json({
            openingBalance,
            closingBalance,
            netMovement,
            purchases,
            transfersIn,
            transfersOut,
            expended,
            assigned
        });

    } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getNetMovementDetails = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const { clause, params, paramIndex } = buildWhereClause(req.user, req.query);

        const detailsQuery = `
            SELECT
                am.movement_id,
                am.transaction_date,
                am.movement_type,
                a.name AS asset_name,
                et.type_name AS equipment_type,
                am.quantity,
                fb.base_name AS from_base,
                tb.base_name AS to_base,
                am.notes
            FROM asset_movements am
            JOIN assets a ON am.asset_id = a.asset_id
            JOIN equipment_types et ON a.type_id = et.type_id
            LEFT JOIN bases fb ON am.from_base_id = fb.base_id
            LEFT JOIN bases tb ON am.to_base_id = tb.base_id
            WHERE ${clause}
              AND am.movement_type IN ('purchase', 'transfer_in', 'transfer_out')
              AND am.transaction_date >= $${paramIndex}
              AND am.transaction_date <= $${paramIndex + 1}
            ORDER BY am.transaction_date DESC;
        `;
        const result = await db.query(detailsQuery, [...params, startDate, endDate]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching net movement details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


exports.getFilterOptions = async (req, res) => {
    try {
        const bases = await db.query('SELECT base_id, base_name FROM bases ORDER BY base_name');
        const equipmentTypes = await db.query('SELECT type_id, type_name FROM equipment_types ORDER BY type_name');
        res.json({
            bases: bases.rows,
            equipmentTypes: equipmentTypes.rows
        });
    } catch (error) {
        console.error('Error fetching filter options:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
