const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Course = require('../models/Course');

const getStats = async (req, res) => {
    try {
        const studentCount = await Student.countDocuments();
        const teacherCount = await Teacher.countDocuments();
        const courseCount = await Course.countDocuments();
        res.status(200).json({ studentCount, teacherCount, courseCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const { sendApprovalEmail, sendRejectionEmail } = require('../utils/email');

const getPendingTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find({ isApproved: false });
        res.status(200).json(teachers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getPendingStudents = async (req, res) => {
    try {
        const students = await Student.find({ isApproved: false });
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const approveTeacher = async (req, res) => {
    const { id } = req.params;
    try {
        const teacher = await Teacher.findByIdAndUpdate(id, { isApproved: true }, { new: true });
        if (teacher) {
            await sendApprovalEmail(teacher.email, teacher.name);
        }
        res.status(200).json(teacher);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const rejectTeacher = async (req, res) => {
    const { id } = req.params;
    try {
        const teacher = await Teacher.findById(id);
        if (teacher) {
            await sendRejectionEmail(teacher.email, teacher.name);
            await Teacher.findByIdAndDelete(id); // Or keep with rejected flag
        }
        res.status(200).json({ message: 'Teacher rejected and removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const approveStudent = async (req, res) => {
    const { id } = req.params;
    try {
        const student = await Student.findByIdAndUpdate(id, { isApproved: true }, { new: true });
        if (student) {
            await sendApprovalEmail(student.email, student.name);
        }
        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const rejectStudent = async (req, res) => {
    const { id } = req.params;
    try {
        const student = await Student.findById(id);
        if (student) {
            await sendRejectionEmail(student.email, student.name);
            await Student.findByIdAndDelete(id);
        }
        res.status(200).json({ message: 'Student rejected and removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    getStats,
    getPendingTeachers,
    getPendingStudents,
    approveTeacher,
    rejectTeacher,
    approveStudent,
    rejectStudent
};
