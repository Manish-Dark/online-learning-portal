const LiveStream = require('../models/LiveStream');
const Student = require('../models/Student');

// Start a new live stream
const startStream = async (req, res) => {
    try {
        const { title, embedUrl, course, branch } = req.body;
        
        // Deactivate any previously active streams for this teacher
        await LiveStream.updateMany(
            { teacherId: req.userId, isActive: true },
            { $set: { isActive: false } }
        );

        const newStream = new LiveStream({
            title,
            embedUrl,
            course,
            branch,
            teacherId: req.userId,
            isActive: true
        });

        await newStream.save();
        res.status(201).json({ message: 'Live stream started successfully', stream: newStream });
    } catch (error) {
        console.error('Start Stream Error:', error);
        res.status(500).json({ message: 'Error starting live stream', error: error.message });
    }
};

// Stop an active live stream
const stopStream = async (req, res) => {
    try {
        const { id } = req.params;
        const stream = await LiveStream.findById(id);

        if (!stream) {
            return res.status(404).json({ message: 'Live stream not found' });
        }

        // Only the teacher who created it or an admin can stop it
        if (stream.teacherId.toString() !== req.userId && req.userRole !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to stop this stream' });
        }

        stream.isActive = false;
        await stream.save();

        res.status(200).json({ message: 'Live stream stopped successfully', stream });
    } catch (error) {
        console.error('Stop Stream Error:', error);
        res.status(500).json({ message: 'Error stopping live stream', error: error.message });
    }
};

// Get active streams based on user role
const getActiveStreams = async (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;

        let filter = { isActive: true };

        if (userRole === 'student') {
            const student = await Student.findById(userId);
            if (!student) return res.status(404).json({ message: 'Student not found' });

            filter.course = student.course;
            
            // If student has a branch, they can see streams for their branch or streams without a branch
            if (student.branch) {
                filter.$or = [
                    { branch: student.branch },
                    { branch: null },
                    { branch: '' }
                ];
            } else {
                filter.branch = { $in: [null, ''] }; 
            }
        } else if (userRole === 'teacher') {
            filter.teacherId = userId; // Teacher only sees their own active streams
        }

        const streams = await LiveStream.find(filter).populate('teacherId', 'name').sort({ createdAt: -1 });
        res.status(200).json(streams);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching live streams', error: error.message });
    }
};

// Get history of streams for a teacher
const getStreamHistory = async (req, res) => {
    try {
        // Teacher sees all their past streams
        const streams = await LiveStream.find({ teacherId: req.userId }).sort({ createdAt: -1 });
        res.status(200).json(streams);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stream history', error: error.message });
    }
};

module.exports = { startStream, stopStream, getActiveStreams, getStreamHistory };
