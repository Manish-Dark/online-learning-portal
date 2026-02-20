const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { cloudinary } = require('./config/cloudinary');

// Create a dummy PDF file
const testFilePath = path.join(__dirname, 'test-upload.pdf');
fs.writeFileSync(testFilePath, '%PDF-1.4\n%\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>\nendobj\n4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n5 0 obj\n<< /Length 44 >>\nstream\nBT /F1 24 Tf 100 700 Td (Hello World) Tj ET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000157 00000 n \n0000000302 00000 n \n0000000389 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n483\n%%EOF');

console.log('Testing Cloudinary Connection...');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);

cloudinary.uploader.upload(testFilePath, {
    resource_type: 'auto',
    type: 'authenticated',
    folder: 'online-learning-portal',
    public_id: 'test-upload-pdf-' + Date.now()
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
