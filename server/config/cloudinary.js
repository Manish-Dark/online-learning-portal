const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const isPdf = file.mimetype === 'application/pdf';
        return {
            folder: 'online-learning-portal',
            resource_type: isPdf ? 'raw' : 'auto',
            format: isPdf ? 'pdf' : undefined,
            public_id: file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, '') + '-' + Date.now(),
            type: 'upload' // Explicitly set to 'upload' (public) to avoid 401 errors
        };
    },
});

module.exports = {
    cloudinary,
    storage
};
