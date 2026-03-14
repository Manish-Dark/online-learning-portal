const mongoose = require('mongoose');

const liveStreamSchema = new mongoose.Schema({
    title: { type: String, required: true },
    embedUrl: { type: String, required: true }, // The YouTube, Vimeo, etc. embed URL
    course: { type: String, required: true },
    branch: { type: String }, // Optional
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    isActive: { type: Boolean, default: true }, // True when stream is ongoing
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LiveStream', liveStreamSchema);
