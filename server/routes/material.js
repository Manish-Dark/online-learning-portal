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

// const { storage } = require('../config/cloudinary');
const storage = multer.memoryStorage();
console.log('Storage Engine Type:', storage.constructor.name);

const ALLOWED_MIMETYPES = new Set([
    // PDF
    'application/pdf',
    // Word
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // PowerPoint
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // Excel
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // Text
    'text/plain',
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    // ZIP / RAR (for bundled materials)
    'application/zip',
    'application/x-zip-compressed',
]);

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (ALLOWED_MIMETYPES.has(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`File type "${file.mimetype}" is not allowed. Supported: PDF, Word, PowerPoint, Excel, TXT, Images`), false);
        }
    },
    limits: { fileSize: 50 * 1024 * 1024 } // 50 MB per file
});


console.log('addLink Type:', typeof addLink);

router.post('/upload', auth, teacherLimit, upload.array('files', 10), uploadMaterial);
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
