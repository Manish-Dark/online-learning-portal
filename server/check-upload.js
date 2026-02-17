const mongoose = require('mongoose');
const StudyMaterial = require('./models/StudyMaterial'); // Adjust path if needed
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function checkLastUpload() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const material = await StudyMaterial.findOne().sort({ _id: -1 });

        if (material) {
            console.log('--- Last Uploaded Material ---');
            console.log('Title:', material.title);
            console.log('File URL:', material.fileUrl);
            console.log('Type:', material.type);
            console.log('ID:', material._id);
            console.log('Created At:', material._id.getTimestamp());
        } else {
            console.log('No materials found.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkLastUpload();
