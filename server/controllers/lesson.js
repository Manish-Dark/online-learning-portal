const Lesson = require('../models/Lesson');
const Course = require('../models/Course');

const createLesson = async (req, res) => {
    const lesson = req.body;

    // Basic validation
    if (!lesson.courseId || !lesson.title || !lesson.videoUrl) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const newLesson = new Lesson({ ...lesson, createdAt: new Date().toISOString() });

    try {
        await newLesson.save();

        // Add lesson to course
        await Course.findByIdAndUpdate(lesson.courseId, { $push: { lessons: newLesson._id } });

        res.status(201).json(newLesson);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
};

const getLessons = async (req, res) => {
    const { courseId } = req.params;
    try {
        const lessons = await Lesson.find({ courseId }).sort({ order: 1 });
        res.status(200).json(lessons);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

module.exports = { createLesson, getLessons };
