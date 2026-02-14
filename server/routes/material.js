const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

console.log('Material Routes File Loaded'); // Debug log

router.use((req, res, next) => {
    console.log(`[Materials Router] ${req.method} ${req.url}`);
    next();
});

const { uploadMaterial, getMaterials, downloadMaterial, addLink } = require('../controllers/material');
const { auth, teacherLimit } = require('../middleware/auth');

// Configure Multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        // Create directory if it doesn't exist (Node 10+ has fs.mkdir recursive)
        const fs = require('fs');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Unique filename: fieldname-timestamp.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDFs are allowed'), false);
        }
    }
});

console.log('addLink Type:', typeof addLink);

router.post('/upload', auth, teacherLimit, upload.single('file'), uploadMaterial);
router.post('/link', auth, teacherLimit, addLink); // New route for links (JSON body)
router.get('/', auth, getMaterials);
router.delete('/:id', auth, teacherLimit, require('../controllers/material').deleteMaterial);
router.get('/download/:id', downloadMaterial);
router.get('/test', (req, res) => res.json({ message: 'Material Routes Working' }));

router.use((req, res) => {
    console.log(`[Materials Router] Unhandled Request: ${req.method} ${req.url}`);
    res.status(404).json({ message: 'Material route not handled' });
});

// Print registered routes for debugging
router.stack.forEach(r => {
    if (r.route && r.route.path) {
        console.log(`[Materials Route Registered] ${Object.keys(r.route.methods).join(',').toUpperCase()} ${r.route.path}`);
    }
});

module.exports = router;
