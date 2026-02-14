const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

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
const path = require('path');

// Direct download route at root level - MOVED TO TOP
app.get('/download/:id', async (req, res) => {
    try {
        const material = await StudyMaterial.findById(req.params.id);
        console.log('Root Download request for ID:', req.params.id);

        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        // Normalize fileUrl to use correct path separators for the OS
        const normalizedFileUrl = material.fileUrl.split('/').join(path.sep);
        const filePath = path.resolve(__dirname, normalizedFileUrl);
        console.log('Attempting to download file from root route:', filePath);

        res.download(filePath, material.title + path.extname(material.fileUrl), (err) => {
            if (err) {
                console.error('Download error:', err);
                if (!res.headersSent) {
                    res.status(500).send('Could not download file');
                }
            }
        });
    } catch (error) {
        console.error('Root download error:', error);
        res.status(500).json({ message: 'Error downloading material', error: error.message });
    }
});

// Database Connection
const seedAdmin = require('./seedAdmin');
const seedTeacher = require('./seedTeacher');

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB Connected');
        seedAdmin();
        seedTeacher();
    })
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

const authRoutes = require('./routes/auth');

const courseRoutes = require('./routes/course');

const lessonRoutes = require('./routes/lesson');

const adminRoutes = require('./routes/admin');

const quizRoutes = require('./routes/quiz');

// Routes Configuration
app.use('/auth', authRoutes);
app.use('/courses', courseRoutes);
app.use('/lessons', lessonRoutes);
app.use('/admin', adminRoutes);
app.use('/quizzes', quizRoutes);

const materialRoutes = require('./routes/material');
const siteSettingsRoutes = require('./routes/siteSettings');

// Direct download route to bypass potential router issues
// (Merged to top of file)



app.use('/materials', materialRoutes);
app.use('/api/site-settings', siteSettingsRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));





app.get('/', (req, res) => {
    res.send('API is running...');
});

// Sanity check route to verify server is reachable
app.get('/sanity', (req, res) => {
    res.send('Sanity check passed!');
});

app.get('/debug/materials', async (req, res) => {
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
