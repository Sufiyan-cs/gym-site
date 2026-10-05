const express = require('express');
const router = express.Router();
const { run, queryOne } = require('../db/connection');
const { authenticateToken } = require('../middleware/auth');

router.put('/profile', authenticateToken, (req, res) => {
    const { name, avatar_url, social_instagram, social_youtube, weight, height, goal, social_links, target_weight, targetWeight, preferred_slot, preferredSlot, custom_split, customSplit } = req.body;
    
    try {
        const userId = req.user.id;
        
        // Dynamically build update query based on provided fields
        const fields = [];
        const values = [];
        
        if (name !== undefined) { fields.push('name = ?'); values.push(name); }
        if (avatar_url !== undefined) { fields.push('avatar_url = ?'); values.push(avatar_url); }
        if (social_instagram !== undefined) { fields.push('social_instagram = ?'); values.push(social_instagram); }
        if (social_youtube !== undefined) { fields.push('social_youtube = ?'); values.push(social_youtube); }
        if (weight !== undefined) { fields.push('weight = ?'); values.push(weight); }
        if (height !== undefined) { fields.push('height = ?'); values.push(height); }
        if (goal !== undefined) { fields.push('goal = ?'); values.push(goal); }
        
        const finalTargetWeight = target_weight !== undefined ? target_weight : targetWeight;
        if (finalTargetWeight !== undefined) { fields.push('target_weight = ?'); values.push(finalTargetWeight); }

        const finalPreferredSlot = preferred_slot !== undefined ? preferred_slot : preferredSlot;
        if (finalPreferredSlot !== undefined) { fields.push('preferred_slot = ?'); values.push(finalPreferredSlot); }

        const finalSplit = custom_split !== undefined ? custom_split : customSplit;
        if (finalSplit !== undefined) { 
            const splitStr = typeof finalSplit === 'string' ? finalSplit : JSON.stringify(finalSplit);
            fields.push('custom_split = ?'); values.push(splitStr); 
        }

        if (social_links !== undefined) { 
            const linksStr = typeof social_links === 'string' ? social_links : JSON.stringify(social_links);
            fields.push('social_links = ?'); values.push(linksStr); 
        }
        
        if (fields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }
        
        values.push(userId);
        
        run(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
        
        const updatedUser = queryOne('SELECT id, name, phone, role, avatar_url, social_instagram, social_youtube, weight, height, goal, target_weight as targetWeight, preferred_slot as preferredSlot, custom_split as customSplit, onboarding_completed, social_links, joined_at, is_active FROM users WHERE id = ?', [userId]);
        
        res.json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
