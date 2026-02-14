const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    course: { type: String, required: true }, // e.g., B.Tech, M.Tech, BCA, MCA
    branch: { type: String }, // e.g., CSE, CSD, AIML (Required if course has branches)
    fatherName: { type: String },
    motherName: { type: String },
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    progress: [{
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
        completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
        quizScores: [{
            quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
            score: Number
        }]
    }],
    isApproved: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
}, { collection: 'students' });

module.exports = mongoose.model('Student', studentSchema);
