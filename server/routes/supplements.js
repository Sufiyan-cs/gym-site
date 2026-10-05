const express = require('express');
const router = express.Router();
const { query, queryOne, run } = require('../db/connection');
const { authenticateToken, isAdmin } = require('../middleware/auth');

router.get('/', (req, res) => {
    try {
        const supps = query('SELECT * FROM supplements');
        res.json(supps);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/order', authenticateToken, (req, res) => {
    const { supplement_id, quantity } = req.body;
    try {
        const supp = queryOne('SELECT * FROM supplements WHERE id = ?', [supplement_id]);
        if (!supp || !supp.in_stock) {
            return res.status(400).json({ error: 'Supplement not available' });
        }
        
        run('INSERT INTO supplement_orders (user_id, supplement_id, quantity) VALUES (?, ?, ?)', [req.user.id, supplement_id, quantity]);
          
        res.json({ success: true, message: 'Order placed, please pay at counter' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/orders', authenticateToken, isAdmin, (req, res) => {
    try {
        const orders = query(`
            SELECT o.id, o.quantity, o.status, o.created_at, u.name as user_name, s.name as supplement_name
            FROM supplement_orders o
            JOIN users u ON o.user_id = u.id
            JOIN supplements s ON o.supplement_id = s.id
            ORDER BY o.created_at DESC
        `);
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/:id', authenticateToken, isAdmin, (req, res) => {
    const { name, description, price, in_stock, image_url } = req.body;
    try {
        run(`
            UPDATE supplements 
            SET name = COALESCE(?, name), description = COALESCE(?, description), 
                price = COALESCE(?, price), in_stock = COALESCE(?, in_stock), image_url = COALESCE(?, image_url)
            WHERE id = ?
        `, [name, description, price, in_stock, image_url, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
