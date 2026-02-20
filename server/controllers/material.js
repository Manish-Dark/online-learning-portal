const StudyMaterial = require('../models/StudyMaterial');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const uploadMaterial = async (req, res) => {
    try {
        console.log('Upload Request Body:', req.body);
        console.log('Upload Request Files (count):', req.files?.length);

        const { title, description, course, branch, type, linkUrl } = req.body;
        const files = req.files;

        // Validation based on type
        if (type === 'file' && (!files || files.length === 0)) {
            return res.status(400).json({ message: 'No files uploaded for file type material' });
        }
        if (type === 'link' && !linkUrl) {
            return res.status(400).json({ message: 'Link URL is required for link type material' });
        }

        if (type === 'link') {
            // Handle Link (Single)
            const materialData = {
                title,
                description,
                type: 'link',
                linkUrl,
                course,
                branch,
                uploadedBy: req.userId
            };
            const material = new StudyMaterial(materialData);
            await material.save();
            return res.status(201).json({ message: 'Link added successfully', material });
        } else {
            // Handle Files (Multiple)
            const uploadedMaterials = [];

            for (const file of files) {
                // Determine Title: Use form title if single file, else use filename
                let materialTitle = title;
                if (files.length > 1) {
                    // Use filename without extension
                    materialTitle = path.parse(file.originalname).name;
                } else {
                    // If title is empty, fallback to filename
                    materialTitle = title || path.parse(file.originalname).name;
                }

                const materialData = {
                    title: materialTitle,
                    description,
                    type: 'file',
                    course,
                    branch,
                    uploadedBy: req.userId
                };

                if (file.buffer) {
                    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
                    const filename = `${Date.now()}-${file.originalname}`;

                    const uploadStream = bucket.openUploadStream(filename, {
                        contentType: file.mimetype,
                        metadata: { contentType: file.mimetype }
                    });

                    await new Promise((resolve, reject) => {
                        uploadStream.on('error', (error) => reject(error));
                        uploadStream.on('finish', () => resolve());
                        uploadStream.end(file.buffer);
                    });

                    materialData.fileUrl = filename;
                }

                const material = new StudyMaterial(materialData);
                await material.save();
                uploadedMaterials.push(material);
            }
            res.status(201).json({ message: 'Materials uploaded successfully', materials: uploadedMaterials });
        }

    } catch (error) {
        console.error('Error uploading material:', error);
        res.status(500).json({ message: 'Error uploading material', error: error.message });
    }
};

const addLink = async (req, res) => {
    try {

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

        // Try to serve from GridFS
        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });

        // Check if file exists in GridFS first to avoid stream errors on start
        const cursor = bucket.find({ filename: material.fileUrl });
        const files = await cursor.toArray();

        if (files.length > 0) {
            // GridFS file found
            const file = files[0];



            // Determine Content-Type
            let contentType = file.contentType;
            if (!contentType && file.metadata && file.metadata.contentType) {
                contentType = file.metadata.contentType;
            }
            // Fallback to extension-based MIME type
            if (!contentType || contentType === 'application/octet-stream') {
                const ext = path.extname(material.fileUrl).toLowerCase();


                if (ext === '.pdf') contentType = 'application/pdf';
                else if (ext === '.txt') contentType = 'text/plain';
                else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
                else if (ext === '.png') contentType = 'image/png';
                else if (ext === '.doc' || ext === '.docx') contentType = 'application/msword';
            }


            res.set('Content-Type', contentType || 'application/octet-stream');

            const disposition = req.query.inline === 'true' ? 'inline' : 'attachment';
            const filename = material.title + (path.extname(material.fileUrl) || '.pdf');

            res.set('Content-Disposition', `${disposition}; filename="${filename}"`);

            const downloadStream = bucket.openDownloadStreamByName(material.fileUrl);
            downloadStream.pipe(res);
        } else {
            // Not in GridFS, try local filesystem (fallback)
            const normalizedFileUrl = material.fileUrl.split('/').join(path.sep);
            const filePath = path.resolve(__dirname, '..', normalizedFileUrl);

            // Check if file exists locally
            if (fs.existsSync(filePath)) {
                const disposition = req.query.inline === 'true' ? 'inline' : 'attachment';

                // Determine Content-Type for local file
                let contentType = 'application/octet-stream';
                const ext = path.extname(material.fileUrl).toLowerCase();

                if (ext === '.pdf') contentType = 'application/pdf';
                else if (ext === '.txt') contentType = 'text/plain';
                else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
                else if (ext === '.png') contentType = 'image/png';

                res.set('Content-Type', contentType);
                res.download(filePath, material.title + path.extname(material.fileUrl), {
                    headers: {
                        'Content-Disposition': `${disposition}; filename="${material.title + path.extname(material.fileUrl)}"`
                    }
                });
            } else {
                if (!res.headersSent) {
                    res.status(404).json({ message: 'File not found on server' });
                }
            }
        }

    } catch (error) {
        console.error('Error downloading material:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Error downloading material', error: error.message });
        }
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

        // If it's URL (Cloudinary), allow deletion (we can't delete from Cloudinary easily without library import here, skipping for now as it's just a link in DB effectively)
        // If it's a file but not http...
        if (material.type === 'file' && material.fileUrl && !material.fileUrl.startsWith('http')) {
            // Try GridFS delete
            const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
            const cursor = bucket.find({ filename: material.fileUrl });
            const files = await cursor.toArray();

            if (files.length > 0) {
                await bucket.delete(files[0]._id);
            } else {
                // Try local delete
                const filePath = path.resolve(__dirname, '..', material.fileUrl);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
        }

        await StudyMaterial.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Material deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting material', error: error.message });
    }
};

module.exports = { uploadMaterial, getMaterials, downloadMaterial, addLink, deleteMaterial };
