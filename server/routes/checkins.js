const express = require('express');
const router = express.Router();
const { query, queryOne, run } = require('../db/connection');
const { authenticateToken, isAdmin } = require('../middleware/auth');

router.post('/in', authenticateToken, (req, res) => {
    try {
        const existing = queryOne('SELECT id FROM check_ins WHERE user_id = ? AND check_out_time IS NULL', [req.user.id]);
        if (existing) {
            return res.status(400).json({ error: 'Already checked in' });
        }
        
        run('INSERT INTO check_ins (user_id, check_in_time) VALUES (?, datetime("now"))', [req.user.id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/out', authenticateToken, (req, res) => {
    try {
        const active = queryOne('SELECT id, check_in_time FROM check_ins WHERE user_id = ? AND check_out_time IS NULL', [req.user.id]);
        if (!active) {
            return res.status(400).json({ error: 'Not checked in' });
        }
        
        run('UPDATE check_ins SET check_out_time = datetime("now") WHERE id = ?', [active.id]);
        
        // Calculate duration
        const updated = queryOne(`
            UPDATE check_ins 
            SET duration_minutes = CAST((julianday(check_out_time) - julianday(check_in_time)) * 24 * 60 AS INTEGER)
            WHERE id = ? RETURNING duration_minutes
        `, [active.id]);
        
        // Update streak if duration >= 45
        if (updated && updated.duration_minutes >= 45) {
            const today = new Date().toISOString().split('T')[0];
            run('UPDATE check_ins SET streak_valid = 1 WHERE id = ?', [active.id]);
            
            const streak = queryOne('SELECT * FROM streaks WHERE user_id = ?', [req.user.id]);
            if (streak) {
                if (streak.last_check_date !== today) {
                    const newStreak = streak.current_streak + 1;
                    const newLongest = Math.max(newStreak, streak.longest_streak);
                    run('UPDATE streaks SET current_streak = ?, longest_streak = ?, last_check_date = ? WHERE user_id = ?', [newStreak, newLongest, today, req.user.id]);
                }
            } else {
                run('INSERT INTO streaks (user_id, current_streak, longest_streak, last_check_date) VALUES (?, 1, 1, ?)', [req.user.id, today]);
            }
        }
        
        res.json({ success: true, duration_minutes: updated ? updated.duration_minutes : 0 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/active', authenticateToken, (req, res) => {
    try {
        const active = query(`
            SELECT c.id as checkin_id, c.check_in_time, u.id, u.name, u.avatar_url,
                   u.goal, u.preferred_slot as preferredSlot, u.social_instagram, u.social_youtube,
                   u.role, u.custom_split as customSplit
            FROM check_ins c 
            JOIN users u ON c.user_id = u.id 
            WHERE c.check_out_time IS NULL
            ORDER BY c.check_in_time DESC
        `);
        res.json(active);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/leaderboard', authenticateToken, (req, res) => {
    try {
        const leaders = query(`
            SELECT u.name, u.avatar_url, s.current_streak, s.longest_streak
            FROM streaks s
            JOIN users u ON s.user_id = u.id
            WHERE u.is_active = 1
            ORDER BY s.current_streak DESC, s.longest_streak DESC
            LIMIT 10
        `);
        res.json(leaders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
