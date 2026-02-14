const express = require('express');
const router = express.Router();
const SiteSettings = require('../models/SiteSettings');
const { auth } = require('../middleware/auth');

// Get Site Settings (Public)
router.get('/', async (req, res) => {
    try {
        const settings = await SiteSettings.getSettings();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching site settings', error: error.message });
    }
});

// Update Site Settings (Admin only - using auth middleware + role check)
// Assuming auth middleware adds user to req.user
router.put('/', auth, async (req, res) => {
    try {
        // Simple admin check
        if (req.userRole !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const { githubLink, linkedinLink, copyrightText, brandName, logoUrl } = req.body;

        // Find and update or create if not exists (though getSettings ensures existence)
        let settings = await SiteSettings.findOne();
        if (!settings) {
            settings = new SiteSettings();
        }

        if (githubLink !== undefined) settings.githubLink = githubLink;
        if (linkedinLink !== undefined) settings.linkedinLink = linkedinLink;
        if (copyrightText !== undefined) settings.copyrightText = copyrightText;
        if (brandName !== undefined) settings.brandName = brandName;
        if (logoUrl !== undefined) settings.logoUrl = logoUrl;
        settings.lastUpdated = Date.now();

        await settings.save();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error updating site settings', error: error.message });
    }
});

module.exports = router;
