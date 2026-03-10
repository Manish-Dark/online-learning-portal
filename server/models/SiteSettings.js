const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
    githubLink: {
        type: String,
        default: 'https://github.com/Manish-Dark'
    },
    linkedinLink: {
        type: String,
        default: 'https://www.linkedin.com/in/manish-sharma-426039297'
    },
    copyrightText: {
        type: String,
        default: '2026 Manish Dark'
    },
    brandName: {
        type: String,
        default: 'EduPortal'
    },
    logoUrl: {
        type: String,
        default: ''
    },
    backgroundUrl: {
        type: String,
        default: ''
    },
    // Authentication Pages Content
    authPageTitle: {
        type: String,
        default: 'LEARNHUB'
    },
    authPageWelcomeText: {
        type: String,
        default: 'Begin your journey with us.'
    },
    authPageDescription: {
        type: String,
        default: 'Create an account to unlock exclusive courses, track your progress, and connect with expert educators globally.'
    },
    // Hero Content
    heroHeadline: {
        type: String,
        default: 'Master New Skills with'
    },
    heroSubtext: {
        type: String,
        default: 'The ultimate platform for students and teachers. Learn at your own pace, track your progress, and achieve your goals.'
    },
    ctaButtonText: {
        type: String,
        default: 'Get Started Free'
    },
    // Animation Settings
    animationType: {
        type: String,
        enum: ['particles', 'waves', 'geometric', 'gradient'],
        default: 'particles'
    },
    animationSpeed: {
        type: String,
        enum: ['slow', 'medium', 'fast'],
        default: 'medium'
    },
    primaryColor: {
        type: String,
        default: '#4F46E5'
    },
    particleCount: {
        type: Number,
        default: 60,
        min: 10,
        max: 150
    },
    showFloatingCards: {
        type: Boolean,
        default: true
    },
    // Academic Courses & Branches
    academicCourses: {
        type: [
            {
                name: { type: String, required: true },
                branches: { type: [String], default: [] }
            }
        ],
        default: [
            { name: 'B.Tech', branches: ['CSE', 'CSD', 'AIML', 'Mechanical', 'Civil'] },
            { name: 'M.Tech', branches: ['CSE', 'CSD', 'AIML', 'Mechanical', 'Civil'] },
            { name: 'BCA', branches: [] },
            { name: 'MCA', branches: [] }
        ]
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Ensure only one document exists
siteSettingsSchema.statics.getSettings = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
