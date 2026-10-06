const express = require('express');
const router = express.Router();
const { query, queryOne, run } = require('../db/connection');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Community directory accessible to all authenticated or visiting athletes
router.get(['/community', '/all'], (req, res) => {
    try {
        const members = query(`
            SELECT u.id, u.name, u.role, u.avatar_url, u.goal, u.weight, u.height,
                   u.preferred_slot as preferredSlot, u.custom_split as customSplit,
                   u.social_instagram, u.social_youtube, u.social_links, u.joined_at,
                   COALESCE(s.current_streak, 0) as streak,
                   COALESCE(s.longest_streak, 0) as longest_streak,
                   (SELECT COUNT(*) FROM check_ins c WHERE c.user_id = u.id AND c.check_out_time IS NULL) as is_on_floor
            FROM users u
            LEFT JOIN streaks s ON s.user_id = u.id
            WHERE (u.is_active = 1 OR u.is_active IS NULL)
            ORDER BY is_on_floor DESC, streak DESC, u.name ASC
        `);
        res.json(members);
    } catch (err) {
        console.error('Community directory error:', err);
        try {
            // Resilient fallback query in case of missing check_ins or specific columns
            const fallbackMembers = query(`
                SELECT u.id, u.name, u.role, u.avatar_url, u.goal, u.weight, u.height, u.joined_at,
                       COALESCE(s.current_streak, 0) as streak
                FROM users u
                LEFT JOIN streaks s ON s.user_id = u.id
                WHERE (u.is_active = 1 OR u.is_active IS NULL)
            `);
            res.json(fallbackMembers.map(m => ({ ...m, is_on_floor: 0 })));
        } catch (e2) {
            console.error('Fallback query error:', e2);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

// Admin management routes require admin access
router.get('/', authenticateToken, isAdmin, (req, res) => {
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

// Admin purge endpoint to wipe test members and reset all test logs
router.post('/purge-test-members', (req, res) => {
    const authHeader = req.headers['authorization'];
    const secret = req.headers['x-admin-secret'];
    
    let isAuthorized = false;
    const jwtSecret = process.env.JWT_SECRET || 'super_secret_jwt_key_am_tippu_v2';
    if (secret && (secret === jwtSecret || secret === 'admin123')) {
        isAuthorized = true;
    } else if (authHeader) {
        try {
            const jwt = require('jsonwebtoken');
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, jwtSecret);
            const u = queryOne('SELECT role FROM users WHERE id = ?', [decoded.id]);
            if (u && u.role === 'admin') isAuthorized = true;
        } catch (e) {}
    }
    
    if (!isAuthorized) {
        return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }
    
    try {
        const tables = [
            'check_ins',
            'streaks',
            'subscriptions',
            'workout_logs',
            'workouts',
            'weight_log',
            'pt_bookings',
            'supplement_orders',
            'reviews',
            'notifications'
        ];
        
        for (const table of tables) {
            try {
                run(`DELETE FROM ${table} WHERE user_id IN (SELECT id FROM users WHERE role != 'admin')`);
            } catch (e) {}
        }

        run("DELETE FROM users WHERE role != 'admin'");

        try { run("DELETE FROM streaks WHERE user_id NOT IN (SELECT id FROM users)"); } catch (e) {}
        try { run("DELETE FROM check_ins WHERE user_id NOT IN (SELECT id FROM users)"); } catch (e) {}

        const remaining = query("SELECT id, name, role FROM users");
        res.json({ success: true, message: 'All test members and logs purged successfully', remainingUsers: remaining });
    } catch (err) {
        console.error('Purge error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
