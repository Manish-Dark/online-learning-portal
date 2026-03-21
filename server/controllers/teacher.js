const Student = require('../models/Student');

// ── Student Management for Teachers ──

const getStudents = async (req, res) => {
    try {
        const students = await Student.find({}, '-password');
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteStudent = async (req, res) => {
    const { id } = req.params;
    try {
        const student = await Student.findById(id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        await Student.findByIdAndDelete(id);
        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateStudent = async (req, res) => {
    const { id } = req.params;
    const { name, email, password, fatherName, motherName, course, branch } = req.body;
    try {
        const student = await Student.findById(id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        // Check for email conflict with another user
        if (email && email !== student.email) {
            const existing = await Student.findOne({ email });
            if (existing) return res.status(400).json({ message: 'Email already in use' });
        }

        if (name) student.name = name;
        if (email) student.email = email;
        if (password) student.password = password;
        if (fatherName !== undefined) student.fatherName = fatherName;
        if (motherName !== undefined) student.motherName = motherName;
        if (course !== undefined) student.course = course;
        if (branch !== undefined) student.branch = branch;

        await student.save();
        student.password = undefined;
        res.status(200).json({ message: 'Student updated successfully', student });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getStudents,
    deleteStudent,
    updateStudent
};
