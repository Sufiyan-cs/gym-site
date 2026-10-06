const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { queryOne, run } = require('../db/connection');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', (req, res) => {
    const { name, phone, password } = req.body;
    if (!name || !phone || !password) return res.status(400).json({ error: 'Missing required fields' });

    try {
        const existingUser = queryOne('SELECT id FROM users WHERE phone = ?', [phone]);
        if (existingUser) {
            return res.status(400).json({ error: 'Phone number already registered' });
        }

        const password_hash = bcrypt.hashSync(password, 10);
        const result = run('INSERT INTO users (name, phone, password_hash) VALUES (?, ?, ?)', [name, phone, password_hash]);
        
        // Also create streaks row
        run('INSERT INTO streaks (user_id) VALUES (?)', [result.lastInsertRowid]);
        
        const token = jwt.sign({ id: result.lastInsertRowid }, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        res.status(201).json({ token, user: { id: result.lastInsertRowid, name, phone, role: 'member' } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/login', (req, res) => {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ error: 'Missing required fields' });

    try {
        const user = queryOne('SELECT id, name, phone, password_hash, role, avatar_url, social_instagram, social_youtube, weight, height, goal, target_weight as targetWeight, preferred_slot as preferredSlot, custom_split as customSplit, onboarding_completed, social_links, joined_at, is_active FROM users WHERE phone = ?', [phone]);

        if (!user || !user.is_active || !bcrypt.compareSync(password, user.password_hash)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        delete user.password_hash;
        res.json({ token, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/onboarding', authenticateToken, (req, res) => {
    const { weight, height, goal, targetWeight, preferredSlot, customSplit, avatarUrl, avatar_url } = req.body;
    const finalAvatar = avatar_url || avatarUrl;
    
    try {
        const userId = req.user.id;
        if (finalAvatar) {
            run('UPDATE users SET weight = ?, height = ?, goal = ?, target_weight = ?, preferred_slot = ?, custom_split = ?, avatar_url = ?, onboarding_completed = 1 WHERE id = ?', [weight, height, goal, targetWeight, preferredSlot, customSplit ? JSON.stringify(customSplit) : null, finalAvatar, userId]);
        } else {
            run('UPDATE users SET weight = ?, height = ?, goal = ?, target_weight = ?, preferred_slot = ?, custom_split = ?, onboarding_completed = 1 WHERE id = ?', [weight, height, goal, targetWeight, preferredSlot, customSplit ? JSON.stringify(customSplit) : null, userId]);
        }
        
        const updatedUser = queryOne('SELECT id, name, phone, role, avatar_url, social_instagram, social_youtube, weight, height, goal, target_weight as targetWeight, preferred_slot as preferredSlot, custom_split as customSplit, onboarding_completed, social_links, joined_at, is_active FROM users WHERE id = ?', [userId]);
        
        res.json({ message: 'Onboarding completed', user: updatedUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/me', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;
