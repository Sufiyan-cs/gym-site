const jwt = require('jsonwebtoken');
const { queryOne } = require('../db/connection');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Forbidden' });
        
        try {
            const fullUser = queryOne(`
                SELECT u.id, u.name, u.phone, u.role, u.avatar_url, u.social_instagram, u.social_youtube,
                       u.weight, u.height, u.goal, u.target_weight as targetWeight,
                       u.preferred_slot as preferredSlot, u.custom_split as customSplit,
                       u.onboarding_completed, u.social_links, u.joined_at, u.is_active,
                       COALESCE(s.current_streak, 0) as streak, COALESCE(s.longest_streak, 0) as longest_streak
                FROM users u
                LEFT JOIN streaks s ON s.user_id = u.id
                WHERE u.id = ?
            `, [user.id]);
            
            if (!fullUser || (fullUser.is_active !== 1 && fullUser.is_active != null)) {
                return res.status(403).json({ error: 'Account inactive or deleted' });
            }
            
            req.user = fullUser;
            next();
        } catch (dbErr) {
            console.error('DB error in auth:', dbErr);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    });
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Admin access required' });
    }
};

module.exports = { authenticateToken, isAdmin };
