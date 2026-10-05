const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');
const { query, run, exec, save } = require('../db/connection');

// Cache the exercise list in memory on first load
let exerciseCache = null;

function loadExercises() {
    if (exerciseCache) return exerciseCache;
    const filePath = path.join(__dirname, '../data/exercises.json');
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath, 'utf8');
    const exercises = JSON.parse(data);
    exerciseCache = exercises.map(ex => ({
        id: ex.id,
        name: ex.n || 'Unknown',
        muscle_group: ex.bp || 'Unknown',
        target: ex.tg || 'Unknown',
        secondary_muscles: ex.sm || [],
        equipment: ex.eq || 'Unknown',
        steps: ex.st || [],
        img: ex.img || null,
        gif: ex.gif || null
    }));
    return exerciseCache;
}

// GET /api/workouts/library - Full exercise library
router.get('/library', authenticateToken, (req, res) => {
    try {
        const exercises = loadExercises();
        res.json(exercises);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/workouts/exercise/:id - Single exercise detail
router.get('/exercise/:id', authenticateToken, (req, res) => {
    try {
        const exercises = loadExercises();
        const ex = exercises.find(e => e.id === req.params.id);
        if (!ex) return res.status(404).json({ error: 'Exercise not found' });
        res.json(ex);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/workouts - Create a workout routine
router.post('/', authenticateToken, (req, res) => {
    const { name, exercises } = req.body;
    try {
        const result = run('INSERT INTO workouts (user_id, name, exercises_json) VALUES (?, ?, ?)', [req.user.id, name, JSON.stringify(exercises)]);
        res.json({ id: result.lastInsertRowid, success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/workouts/my - User's workout routines
router.get('/my', authenticateToken, (req, res) => {
    try {
        const workouts = query('SELECT * FROM workouts WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
        res.json(workouts.map(w => ({ ...w, exercises: JSON.parse(w.exercises_json) })));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/workouts/log - Log a completed workout
router.post('/log', authenticateToken, (req, res) => {
    const { workout_id, logs } = req.body;
    try {
        exec('BEGIN TRANSACTION');
        for (const log of logs) {
            run('INSERT INTO workout_logs (user_id, workout_id, exercise_id, sets, reps, weight_kg) VALUES (?, ?, ?, ?, ?, ?)', [req.user.id, workout_id, log.exercise_id, log.sets, log.reps, log.weight_kg]);
        }
        exec('COMMIT');
        save();
        res.json({ success: true });
    } catch (err) {
        exec('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
