const express = require('express');
const {
    getStats,
    getPendingTeachers,
    getPendingStudents,
    approveTeacher,
    rejectTeacher,
    approveStudent,
    rejectStudent
} = require('../controllers/admin');
const { auth } = require('../middleware/auth');

const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for background image
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        if (req.path === '/upload-background') {
            cb(null, 'landing-bg.jpg');
        } else if (req.path === '/upload-logo') {
            cb(null, 'logo.png'); // Force png or just use logo with original ext but let's stick to simple
        } else {
            cb(null, file.originalname);
        }
    }
});

const upload = multer({ storage: storage });

// Upload background image
router.post('/upload-background', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({ message: 'Background image updated successfully', filePath: `/uploads/landing-bg.jpg?t=${Date.now()}` });
});

// Upload Logo
router.post('/upload-logo', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({ message: 'Logo updated successfully', filePath: `/uploads/logo.png?t=${Date.now()}` });
});

// Delete background image
router.delete('/background', (req, res) => {
    const filePath = path.join(__dirname, '../uploads/landing-bg.jpg');
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({ message: 'Background image removed successfully' });
    } else {
        res.status(404).json({ message: 'No background image found' });
    }
});

// Delete logo
router.delete('/logo', (req, res) => {
    const filePath = path.join(__dirname, '../uploads/logo.png');
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({ message: 'Logo removed successfully' });
    } else {
        res.status(404).json({ message: 'No logo found' });
    }
});

// Middleware to check if user is admin (hardcoded email or role check)
const adminCheck = (req, res, next) => {
    // In a real app, check for specific admin role or email
    // For this demo, we'll assume any 'teacher' role can access admin to simplify testing, 
    // OR we can make a specific Admin model. 
    // The prompt says "Admin Module (Lightweight)".
    // Let's assume a hardcoded admin email or a role 'admin' if we had one.
    // For now, let's allow teachers to act as admins to bootstrap, or better, 
    // let's check for a specific flag or just allow "teacher" for now as the prompt implies separate Admin module.

    // Actually, let's just make it open to 'teacher' role for simplicity in this MVP 
    // unless we create a specific Admin user.
    // Let's stick to the prompt: "Admin Module". 
    // I'll add a check that they passed a secret header or just reuse auth.
    // Let's assume the user logged in as 'admin' role (which we haven't strictly enforced in registration).
    // I'll add 'admin' role support in registration/login to make this clean.

    if (req.userRole === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: 'Admin access denied' });
    }
};

router.get('/stats', auth, adminCheck, getStats);
// Teachers
router.get('/teachers/pending', auth, adminCheck, getPendingTeachers);
router.put('/teachers/:id/approve', auth, adminCheck, approveTeacher);
router.put('/teachers/:id/reject', auth, adminCheck, rejectTeacher); // Added reject route

// Students
router.get('/students/pending', auth, adminCheck, getPendingStudents);
router.put('/students/:id/approve', auth, adminCheck, approveStudent);
router.put('/students/:id/reject', auth, adminCheck, rejectStudent);

module.exports = router;
