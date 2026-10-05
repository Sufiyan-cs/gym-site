const jwt = require('jsonwebtoken');
const { queryOne } = require('../db/connection');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Forbidden' });
        
        try {
            const fullUser = queryOne('SELECT id, name, phone, role, avatar_url, social_instagram, social_youtube, weight, height, goal, target_weight as targetWeight, preferred_slot as preferredSlot, custom_split as customSplit, onboarding_completed, social_links, joined_at, is_active FROM users WHERE id = ?', [user.id]);
            
            if (!fullUser || !fullUser.is_active) {
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
