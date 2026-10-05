require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const membersRoutes = require('./routes/members');
const subscriptionsRoutes = require('./routes/subscriptions');
const checkinsRoutes = require('./routes/checkins');
const workoutsRoutes = require('./routes/workouts');
const progressRoutes = require('./routes/progress');
const supplementsRoutes = require('./routes/supplements');
const ptRoutes = require('./routes/pt');
const usersRoutes = require('./routes/users');

const app = express();

app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/checkins', checkinsRoutes);
app.use('/api/workouts', workoutsRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/supplements', supplementsRoutes);
app.use('/api/pt', ptRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const { initDb } = require('./db/connection');

const PORT = process.env.PORT || 5000;

initDb().then(() => {
    app.listen(PORT, () => {
        console.log(`AM-Tippu Fitness Backend running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to initialize database', err);
    process.exit(1);
});
