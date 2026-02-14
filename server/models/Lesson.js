const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    title: { type: String, required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    videoUrl: { type: String, required: true },
    notes: String, // URL or text
    order: Number,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lesson', lessonSchema);
