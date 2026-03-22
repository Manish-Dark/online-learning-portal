const Student = require('../models/Student');
const { sendApprovalEmail, sendRejectionEmail } = require('../utils/email');

// ── Student Management for Teachers ──

const getPendingStudents = async (req, res) => {
    try {
        const students = await Student.find({ isApproved: false });
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const approveStudent = async (req, res) => {
    const { id } = req.params;
    try {
        const student = await Student.findByIdAndUpdate(id, { isApproved: true }, { new: true });
        if (student) {
            // Send email in next event loop tick
            setImmediate(() => {
                console.log(`Approving student: ${student.name}, Email: ${student.email}`);
                sendApprovalEmail(student.email, student.name)
                    .then(() => console.log(`Email initiated for ${student.email}`))
                    .catch(err => console.error('Email send failed', err));
            });
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
            setImmediate(() => {
                sendRejectionEmail(student.email, student.name).catch(err => console.error('Email send failed', err));
            });
            await Student.findByIdAndDelete(id);
        }
        res.status(200).json({ message: 'Student rejected and removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const approveAllStudents = async (req, res) => {
    try {
        await Student.updateMany({ isApproved: false }, { $set: { isApproved: true } });
        res.status(200).json({ message: 'All pending students approved successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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
    getPendingStudents,
    approveStudent,
    rejectStudent,
    approveAllStudents,
    deleteStudent,
    updateStudent
};
