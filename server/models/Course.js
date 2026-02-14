const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    category: String,
    thumbnail: String, // URL
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    price: { type: Number, default: 0 }, // Free or Paid
    lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', courseSchema);
