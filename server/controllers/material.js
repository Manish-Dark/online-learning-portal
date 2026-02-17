const StudyMaterial = require('../models/StudyMaterial');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const path = require('path');
const fs = require('fs');

const uploadMaterial = async (req, res) => {
    try {
        console.log('Upload Request Body:', req.body);
        console.log('Upload Request File:', req.file);

        const { title, description, course, branch, type, linkUrl } = req.body;
        const file = req.file;

        // Validation based on type
        if (type === 'file' && !file) {
            return res.status(400).json({ message: 'No file uploaded for file type material' });
        }
        if (type === 'link' && !linkUrl) {
            return res.status(400).json({ message: 'Link URL is required for link type material' });
        }

        const materialData = {
            title,
            description,
            type: type || 'file', // Default to file if not provided (backward compatibility)
            course,
            branch,
            uploadedBy: req.userId
        };

        if (type === 'link') {
            materialData.linkUrl = linkUrl;
        } else {
            // It's a file
            if (file) {
                // Cloudinary returns the URL in file.path (or file.secure_url)
                materialData.fileUrl = file.path;
            }
        }

        const material = new StudyMaterial(materialData);

        await material.save();
        res.status(201).json({ message: 'Material uploaded successfully', material });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ message: 'Error uploading material', error: error.message });
    }
};

const addLink = async (req, res) => {
    try {
        console.log('Add Link Request Body:', req.body);
        const { title, description, course, branch, linkUrl } = req.body;

        if (!linkUrl) {
            return res.status(400).json({ message: 'Link URL is required' });
        }

        const material = new StudyMaterial({
            title,
            description,
            type: 'link',
            linkUrl,
            course,
            branch,
            uploadedBy: req.userId
        });

        await material.save();
        res.status(201).json({ message: 'Link added successfully', material });
    } catch (error) {
        res.status(500).json({ message: 'Error adding link', error: error.message });
    }
};

const downloadMaterial = async (req, res) => {
    try {
        const material = await StudyMaterial.findById(req.params.id);

        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        // Check if fileUrl is a remote URL (Cloudinary)
        if (material.fileUrl && material.fileUrl.startsWith('http')) {
            return res.redirect(material.fileUrl);
        }

        // Fallback for old local files (will likely fail on Vercel but kept for safety)
        const normalizedFileUrl = material.fileUrl.split('/').join(path.sep);
        const filePath = path.resolve(__dirname, '..', normalizedFileUrl);

        res.download(filePath, material.title + path.extname(material.fileUrl), (err) => {
            if (err) {
                console.error('Download error:', err);
                if (!res.headersSent) {
                    res.status(500).send('Could not download file');
                }
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error downloading material', error: error.message });
    }
};

const getMaterials = async (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;

        let filter = {};

        if (userRole === 'student') {
            const student = await Student.findById(userId);
            if (!student) return res.status(404).json({ message: 'Student not found' });

            filter.course = student.course;
            // If student has a branch, filter by it. If material has no branch, it might be general for the course?
            // Let's assume strict matching: Show materials that match student's branch OR have no branch specified (common materials).
            if (student.branch) {
                filter.$or = [
                    { branch: student.branch },
                    { branch: null },
                    { branch: '' }
                ];
            } else {
                // For courses without branches (e.g. maybe BCA), show all or just those with null branch
                // If student has no branch, show materials with no branch.
                filter.branch = { $in: [null, ''] }; // Simplified for now
            }

        } else if (userRole === 'teacher') {
            // Teacher sees what they uploaded, OR everything for their course?
            // "teacher are choose there corsee... give the teacher panle you give the area fro the uploading"
            // Let's let teachers see all materials for their course to avoid duplicates, or just their own.
            // Using "uploadedBy" to let them manage their own.
            filter.uploadedBy = userId;
        }

        const materials = await StudyMaterial.find(filter).populate('uploadedBy', 'name');
        res.status(200).json(materials);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching materials', error: error.message });
    }
};

const deleteMaterial = async (req, res) => {
    try {
        const material = await StudyMaterial.findById(req.params.id);
        if (!material) return res.status(404).json({ message: 'Material not found' });

        // Authorization: Only uploader or admin can delete
        if (material.uploadedBy.toString() !== req.userId && req.userRole !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this material' });
        }

        // If it's a file, delete from filesystem ONLY if it's local
        if (material.type === 'file' && material.fileUrl && !material.fileUrl.startsWith('http')) {
            const filePath = path.resolve(__dirname, '..', material.fileUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await StudyMaterial.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Material deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting material', error: error.message });
    }
};

module.exports = { uploadMaterial, getMaterials, downloadMaterial, addLink, deleteMaterial };
