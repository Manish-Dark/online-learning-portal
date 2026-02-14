const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }, // Optional now
    course: { type: String }, // For string-based targeting (B.Tech, etc.)
    questions: [{
        questionText: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctAnswer: { type: String, required: true } // Store the option text or index
    }],
    branch: { type: String }, // Optional, for specific branch targeting
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', quizSchema);
