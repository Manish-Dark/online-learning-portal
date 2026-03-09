const mongoose = require('mongoose');
const SiteSettings = require('./models/SiteSettings');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        try {
            console.log("Connected to MongoDB.");
            const settings = await SiteSettings.getSettings();
            console.log("Settings retrieved:", settings);
        } catch (err) {
            console.error("Error retrieving settings:", err);
            process.exit(1);
        }
        process.exit();
    })
    .catch(err => {
        console.error("Connection error:", err);
        process.exit(1);
    });
