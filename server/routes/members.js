const express = require('express');
const router = express.Router();
const { query, queryOne, run } = require('../db/connection');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// All routes here require admin access
router.use(authenticateToken, isAdmin);

router.get('/', (req, res) => {
    try {
        const members = query(`
            SELECT u.id, u.name, u.phone, u.role, u.is_active, u.joined_at,
                   s.end_date as subscription_end, s.payment_status
            FROM users u
            LEFT JOIN subscriptions s ON u.id = s.user_id AND s.id = (
                SELECT id FROM subscriptions WHERE user_id = u.id ORDER BY end_date DESC LIMIT 1
            )
            WHERE u.role != 'admin'
        `);
        res.json(members);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/active-count', (req, res) => {
    try {
        const result = queryOne('SELECT COUNT(*) as count FROM check_ins WHERE check_out_time IS NULL');
        res.json({ activeCount: result ? result.count : 0 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/:id', (req, res) => {
    try {
        const member = queryOne('SELECT id, name, phone, role, is_active, joined_at FROM users WHERE id = ?', [req.params.id]);
        if (!member) return res.status(404).json({ error: 'Member not found' });
        res.json(member);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/:id', (req, res) => {
    const { name, phone } = req.body;
    try {
        run('UPDATE users SET name = ?, phone = ? WHERE id = ?', [name, phone, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/:id', (req, res) => {
    try {
        run('UPDATE users SET is_active = 0 WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
