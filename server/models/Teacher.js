const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    course: { type: String, required: true }, // Department/Course they belong to
    isApproved: { type: Boolean, default: false },
    specialization: String,
    createdCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    createdAt: { type: Date, default: Date.now }
}, { collection: 'teachers' });

module.exports = mongoose.model('Teacher', teacherSchema);
