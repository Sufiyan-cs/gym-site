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
        const existingUser = queryOne('SELECT id, is_active FROM users WHERE phone = ?', [phone]);
        if (existingUser && (existingUser.is_active === 1 || existingUser.is_active === null)) {
            return res.status(400).json({ error: 'Phone number already registered' });
        }

        const password_hash = bcrypt.hashSync(password, 10);
        let userId;

        if (existingUser && existingUser.is_active === 0) {
            run('UPDATE users SET name = ?, password_hash = ?, avatar_url = NULL, goal = NULL, weight = NULL, height = NULL, onboarding_completed = 0, is_active = 1 WHERE id = ?', [name, password_hash, existingUser.id]);
            userId = existingUser.id;
            run('DELETE FROM streaks WHERE user_id = ?', [userId]);
            run('INSERT INTO streaks (user_id) VALUES (?)', [userId]);
        } else {
            const result = run('INSERT INTO users (name, phone, password_hash, is_active) VALUES (?, ?, ?, 1)', [name, phone, password_hash]);
            userId = result.lastInsertRowid;
            run('INSERT INTO streaks (user_id) VALUES (?)', [userId]);
        }
        
        const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        res.status(201).json({ token, user: { id: userId, name, phone, role: 'member', is_active: 1 } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/login', (req, res) => {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ error: 'Missing required fields' });

    try {
        const user = queryOne(`
            SELECT u.id, u.name, u.phone, u.password_hash, u.role, u.avatar_url, u.social_instagram, u.social_youtube,
                   u.weight, u.height, u.goal, u.target_weight as targetWeight,
                   u.preferred_slot as preferredSlot, u.custom_split as customSplit,
                   u.onboarding_completed, u.social_links, u.joined_at, u.is_active,
                   COALESCE(s.current_streak, 0) as streak, COALESCE(s.longest_streak, 0) as longest_streak
            FROM users u
            LEFT JOIN streaks s ON s.user_id = u.id
            WHERE u.phone = ?
        `, [phone]);

        if (!user || (user.is_active !== 1 && user.is_active != null) || !bcrypt.compareSync(password, user.password_hash)) {
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
        
        const fields = ['onboarding_completed = 1'];
        const values = [];

        if (weight !== undefined) { fields.push('weight = ?'); values.push(String(weight)); }
        if (height !== undefined) { fields.push('height = ?'); values.push(String(height)); }
        if (goal !== undefined) { fields.push('goal = ?'); values.push(goal); }
        if (targetWeight !== undefined) { fields.push('target_weight = ?'); values.push(String(targetWeight)); }
        if (preferredSlot !== undefined) { fields.push('preferred_slot = ?'); values.push(preferredSlot); }
        if (customSplit !== undefined) { 
            fields.push('custom_split = ?'); 
            values.push(typeof customSplit === 'string' ? customSplit : JSON.stringify(customSplit)); 
        }
        if (finalAvatar && typeof finalAvatar === 'string' && finalAvatar.trim().length > 0) { 
            fields.push('avatar_url = ?'); 
            values.push(finalAvatar); 
        }

        values.push(userId);
        run(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
        
        const updatedUser = queryOne(`
            SELECT u.id, u.name, u.phone, u.role, u.avatar_url, u.social_instagram, u.social_youtube,
                   u.weight, u.height, u.goal, u.target_weight as targetWeight,
                   u.preferred_slot as preferredSlot, u.custom_split as customSplit,
                   u.onboarding_completed, u.social_links, u.joined_at, u.is_active,
                   COALESCE(s.current_streak, 0) as streak, COALESCE(s.longest_streak, 0) as longest_streak
            FROM users u
            LEFT JOIN streaks s ON s.user_id = u.id
            WHERE u.id = ?
        `, [userId]);
        
        res.json({ message: 'Onboarding completed', user: updatedUser });
    } catch (err) {
        console.error('Onboarding update error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/me', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;
