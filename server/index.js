const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// SIMPLE TEST ROUTE
app.get('/testdownload', (req, res) => {
    res.send('Test Download Route is Working!');
});

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Import dependencies for download route
const StudyMaterial = require('./models/StudyMaterial');
// const path = require('path'); // Removed duplicate

const { downloadMaterial } = require('./controllers/material');

// Direct download route using controller (handles GridFS, Cloudinary, Local)
app.get('/api/download/:id', downloadMaterial);

// Database Connection
const seedAdmin = require('./seedAdmin');
const seedTeacher = require('./seedTeacher');

// Database Connection
const connectDB = require('./config/db');

// Database Connection
connectDB().then(() => {
    seedAdmin();
    seedTeacher();
});

const authRoutes = require('./routes/auth');

const courseRoutes = require('./routes/course');

const lessonRoutes = require('./routes/lesson');

const adminRoutes = require('./routes/admin');

const quizRoutes = require('./routes/quiz');

// Routes Configuration
// Routes Configuration
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/quizzes', quizRoutes);

const materialRoutes = require('./routes/material');
const siteSettingsRoutes = require('./routes/siteSettings');

// Direct download route to bypass potential router issues
// (Merged to top of file)



app.use('/api/materials', materialRoutes);
app.use('/api/site-settings', siteSettingsRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));





app.get('/', (req, res) => {
    res.send('API is running...');
});

// Sanity check route to verify server is reachable
app.get('/api/sanity', (req, res) => {
    res.send('Sanity check passed!');
});

app.get('/api/debug/materials', async (req, res) => {
    try {
        const materials = await StudyMaterial.find({});
        res.json(materials);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start Server
app.use((req, res, next) => {
    console.log(`[404] Route not found: ${req.method} ${req.url}`);
    res.status(404).send(`Cannot GET (Logged) ${req.url}`);
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
