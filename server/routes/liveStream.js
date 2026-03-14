const express = require('express');
const { startStream, stopStream, getActiveStreams, getStreamHistory } = require('../controllers/liveStream');
const { auth, teacherLimit } = require('../middleware/auth');

const router = express.Router();

// Get active live streams
router.get('/', auth, getActiveStreams); 

// Get teacher's stream history
router.get('/history', auth, teacherLimit, getStreamHistory);

// Start a new stream (Teacher only)
router.post('/start', auth, teacherLimit, startStream);

// Stop an active stream (Teacher only)
router.put('/:id/stop', auth, teacherLimit, stopStream);

module.exports = router;
