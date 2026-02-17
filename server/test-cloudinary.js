require('dotenv').config({ path: path.join(__dirname, '.env') });
const { cloudinary } = require('./config/cloudinary');
const fs = require('fs');
const path = require('path');

// Create a dummy text file
const testFilePath = path.join(__dirname, 'test-upload.txt');
fs.writeFileSync(testFilePath, 'This is a test file for Cloudinary upload.');

console.log('Testing Cloudinary Connection...');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);

cloudinary.uploader.upload(testFilePath, {
    resource_type: 'raw', // 'raw' for text files, 'auto' usually works too but raw is safer for txt
    folder: 'online-learning-portal',
    public_id: 'test-upload-' + Date.now()
}, (error, result) => {
    if (error) {
        console.error('❌ Upload Failed:', error);
    } else {
        console.log('✅ Upload Successful!');
        console.log('File URL:', result.secure_url);
    }

    // Cleanup
    fs.unlinkSync(testFilePath);
});
