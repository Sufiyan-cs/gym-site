const express = require('express');
const router = express.Router();
const { query, queryOne, run } = require('../db/connection');
const { authenticateToken } = require('../middleware/auth');

router.post('/weight', authenticateToken, (req, res) => {
    const { weight_kg } = req.body;
    try {
        const today = new Date().toISOString().split('T')[0];
        
        // Update if already logged today, else insert
        const existing = queryOne('SELECT id FROM weight_log WHERE user_id = ? AND logged_at = ?', [req.user.id, today]);
        if (existing) {
            run('UPDATE weight_log SET weight_kg = ? WHERE id = ?', [weight_kg, existing.id]);
        } else {
            run('INSERT INTO weight_log (user_id, weight_kg, logged_at) VALUES (?, ?, ?)', [req.user.id, weight_kg, today]);
        }
        
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/weight', authenticateToken, (req, res) => {
    try {
        const history = query('SELECT weight_kg, logged_at FROM weight_log WHERE user_id = ? ORDER BY logged_at ASC', [req.user.id]);
        res.json(history);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/stats', authenticateToken, (req, res) => {
    try {
        const streak = queryOne('SELECT current_streak, longest_streak FROM streaks WHERE user_id = ?', [req.user.id]) || { current_streak: 0, longest_streak: 0 };
        const workoutCountResult = queryOne('SELECT COUNT(DISTINCT workout_id) as count FROM workout_logs WHERE user_id = ?', [req.user.id]);
        const workoutCount = workoutCountResult ? workoutCountResult.count : 0;
        const totalVolumeResult = queryOne('SELECT SUM(sets * reps * weight_kg) as volume FROM workout_logs WHERE user_id = ?', [req.user.id]);
        const totalVolume = (totalVolumeResult && totalVolumeResult.volume) ? totalVolumeResult.volume : 0;
        
        res.json({
            streak: streak.current_streak,
            longest_streak: streak.longest_streak,
            workouts_completed: workoutCount,
            total_volume_kg: totalVolume
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
