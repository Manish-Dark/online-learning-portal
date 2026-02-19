const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');

dotenv.config();

const cloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;

if (cloudinaryConfigured) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
} else {
    console.warn('⚠️ Cloudinary credentials missing! Falling back to local disk storage.');
}

const storage = cloudinaryConfigured ? new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const isPdf = file.mimetype === 'application/pdf';
        return {
            folder: 'online-learning-portal',
            resource_type: isPdf ? 'raw' : 'auto',
            public_id: file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, '') + '-' + Date.now() + (isPdf ? '.pdf' : ''),
        };
    },
}) : require('multer').diskStorage({
    destination: (req, file, cb) => {
        const fs = require('fs');
        const path = require('path');
        const uploadDir = 'uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
    }
});

module.exports = {
    cloudinary,
    storage
};
