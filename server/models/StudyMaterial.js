const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    type: { type: String, enum: ['file', 'link'], default: 'file' },
    fileUrl: {
        type: String,
        required: function () { return this.type === 'file'; }
    },
    linkUrl: {
        type: String,
        required: function () { return this.type === 'link'; }
    },
    course: { type: String, required: true },
    branch: { type: String }, // Optional, if applicable to specific branch
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    createdAt: { type: Date, default: Date.now }
}, { collection: 'materials' });

module.exports = mongoose.model('StudyMaterial', materialSchema);
