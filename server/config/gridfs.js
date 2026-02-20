const connectDB = require('./db');

console.log('GridFS Config: Initializing storage...');

const storage = new GridFsStorage({
    db: connectDB(),
    file: (req, file) => {
        // Use 'uploads' collection for files
        // and match original filename logic if possible, or just date-name
        const match = ['application/pdf', 'text/plain'];

        if (match.indexOf(file.mimetype) === -1) {
            // For other types (if any), maybe null? But we filter in router.
            return `${Date.now()}-${file.originalname}`;
        }

        return {
            bucketName: 'uploads', // This matches the collection name 'uploads.files'
            filename: `${Date.now()}-${file.originalname}`
        };
    }
});

module.exports = storage;
