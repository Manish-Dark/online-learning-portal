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
