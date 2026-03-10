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

// Update Site Settings (Admin only)
router.put('/', auth, async (req, res) => {
    try {
        if (req.userRole !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const {
            githubLink, linkedinLink, copyrightText, brandName, logoUrl, backgroundUrl,
            authPageTitle, authPageWelcomeText, authPageDescription,
            heroHeadline, heroSubtext, ctaButtonText,
            animationType, animationSpeed, primaryColor, particleCount, showFloatingCards
        } = req.body;

        let settings = await SiteSettings.findOne();
        if (!settings) {
            settings = new SiteSettings();
        }

        if (githubLink !== undefined) settings.githubLink = githubLink;
        if (linkedinLink !== undefined) settings.linkedinLink = linkedinLink;
        if (copyrightText !== undefined) settings.copyrightText = copyrightText;
        if (brandName !== undefined) settings.brandName = brandName;
        if (logoUrl !== undefined) settings.logoUrl = logoUrl;
        if (backgroundUrl !== undefined) settings.backgroundUrl = backgroundUrl;

        // Auth Pages Content
        if (authPageTitle !== undefined) settings.authPageTitle = authPageTitle;
        if (authPageWelcomeText !== undefined) settings.authPageWelcomeText = authPageWelcomeText;
        if (authPageDescription !== undefined) settings.authPageDescription = authPageDescription;

        // Animation + Hero fields
        if (heroHeadline !== undefined) settings.heroHeadline = heroHeadline;
        if (heroSubtext !== undefined) settings.heroSubtext = heroSubtext;
        if (ctaButtonText !== undefined) settings.ctaButtonText = ctaButtonText;
        if (animationType !== undefined) settings.animationType = animationType;
        if (animationSpeed !== undefined) settings.animationSpeed = animationSpeed;
        if (primaryColor !== undefined) settings.primaryColor = primaryColor;
        if (particleCount !== undefined) settings.particleCount = Number(particleCount);
        if (showFloatingCards !== undefined) settings.showFloatingCards = showFloatingCards;

        settings.lastUpdated = Date.now();

        await settings.save();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error updating site settings', error: error.message });
    }
});

module.exports = router;
