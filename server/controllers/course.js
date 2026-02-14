const Course = require('../models/Course');
const Teacher = require('../models/Teacher');

const getCourses = async (req, res) => {
    try {
        const courses = await Course.find().populate('instructor', 'name');
        res.status(200).json(courses);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

const createCourse = async (req, res) => {
    const course = req.body;

    if (!req.userId) return res.json({ message: 'Unauthenticated' });

    const newCourse = new Course({ ...course, instructor: req.userId, createdAt: new Date().toISOString() });

    try {
        await newCourse.save();

        // Add course to teacher's createdCourses
        await Teacher.findByIdAndUpdate(req.userId, { $push: { createdCourses: newCourse._id } });

        res.status(201).json(newCourse);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
};

const getCourse = async (req, res) => {
    const { id } = req.params;
    try {
        const course = await Course.findById(id).populate('instructor', 'name').populate('lessons');
        res.status(200).json(course);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

module.exports = { getCourses, createCourse, getCourse };
