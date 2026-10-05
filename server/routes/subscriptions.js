const express = require('express');
const router = express.Router();
const { query, queryOne, run } = require('../db/connection');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const { generateUPILink, generateQRCode } = require('../utils/upi');

const PLANS = [
    { months: 1, amount: 500, label: '1 Month' },
    { months: 3, amount: 1200, label: '3 Months' },
    { months: 6, amount: 2200, label: '6 Months' },
    { months: 12, amount: 3500, label: '12 Months' }
];

router.get('/plans', (req, res) => {
    res.json(PLANS);
});

router.post('/', authenticateToken, async (req, res) => {
    const { plan_months } = req.body;
    const plan = PLANS.find(p => p.months === plan_months);
    if (!plan) return res.status(400).json({ error: 'Invalid plan' });

    try {
        const result = run(`
            INSERT INTO subscriptions (user_id, plan_months, amount, payment_status)
            VALUES (?, ?, ?, 'pending')
        `, [req.user.id, plan.months, plan.amount]);
        
        const subId = result.lastInsertRowid;
        const upiLink = generateUPILink(plan.amount, `Gym_Sub_${subId}`);
        const qrCode = await generateQRCode(upiLink);
        
        res.json({ id: subId, upiLink, qrCode, amount: plan.amount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/:id/approve', authenticateToken, isAdmin, (req, res) => {
    const { id } = req.params;
    try {
        const sub = queryOne('SELECT * FROM subscriptions WHERE id = ?', [id]);
        if (!sub) {
            return res.status(404).json({ error: 'Subscription not found' });
        }
        
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + sub.plan_months);
        
        run(`
            UPDATE subscriptions
            SET payment_status = 'approved', start_date = ?, end_date = ?
            WHERE id = ?
        `, [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0], id]);
        
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/expiring', authenticateToken, isAdmin, (req, res) => {
    try {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        const expiring = query(`
            SELECT u.name, u.phone, s.end_date
            FROM subscriptions s
            JOIN users u ON s.user_id = u.id
            WHERE s.payment_status = 'approved' 
            AND s.end_date BETWEEN date('now') AND ?
        `, [nextWeek.toISOString().split('T')[0]]);
        
        res.json(expiring);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
