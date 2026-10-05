const express = require('express');
const router = express.Router();
const { query, queryOne, run } = require('../db/connection');
const { authenticateToken, isAdmin } = require('../middleware/auth');

router.get('/packages', (req, res) => {
    try {
        const packages = query('SELECT * FROM pt_packages');
        res.json(packages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/book', authenticateToken, (req, res) => {
    const { package_id } = req.body;
    try {
        const pkg = queryOne('SELECT * FROM pt_packages WHERE id = ?', [package_id]);
        if (!pkg) {
            return res.status(404).json({ error: 'Package not found' });
        }
        
        run('INSERT INTO pt_bookings (user_id, package_id, sessions_remaining) VALUES (?, ?, ?)', [req.user.id, package_id, pkg.sessions]);
          
        res.json({ success: true, message: 'PT Package booked. Please complete payment.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/my', authenticateToken, (req, res) => {
    try {
        const bookings = query(`
            SELECT b.*, p.name as package_name, p.sessions as total_sessions
            FROM pt_bookings b
            JOIN pt_packages p ON b.package_id = p.id
            WHERE b.user_id = ? AND b.status = 'active'
        `, [req.user.id]);
        res.json(bookings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/bookings/:id/session', authenticateToken, isAdmin, (req, res) => {
    try {
        const booking = queryOne('SELECT * FROM pt_bookings WHERE id = ?', [req.params.id]);
        if (!booking || booking.sessions_remaining <= 0) {
            return res.status(400).json({ error: 'Invalid booking or no sessions remaining' });
        }
        
        const remaining = booking.sessions_remaining - 1;
        const status = remaining === 0 ? 'completed' : 'active';
        
        run('UPDATE pt_bookings SET sessions_remaining = ?, status = ? WHERE id = ?', [remaining, status, req.params.id]);
          
        res.json({ success: true, sessions_remaining: remaining });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
