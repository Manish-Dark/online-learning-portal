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
            // Send email in next event loop tick to ensure no blocking
            setImmediate(() => {
                console.log(`Approving teacher: ${teacher.name}, Email: ${teacher.email}`);
                sendApprovalEmail(teacher.email, teacher.name)
                    .then(() => console.log(`Email initiated for ${teacher.email}`))
                    .catch(err => console.error('Email send failed', err));
            });
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
            setImmediate(() => {
                sendRejectionEmail(teacher.email, teacher.name).catch(err => console.error('Email send failed', err));
            });
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

const Admin = require('../models/Admin');

const getPendingAdmins = async (req, res) => {
    try {
        const admins = await Admin.find({ isApproved: false }, '-password');
        res.status(200).json(admins);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getActiveAdmins = async (req, res) => {
    try {
        const admins = await Admin.find({ isApproved: true }, '-password');
        res.status(200).json(admins);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const approveAdmin = async (req, res) => {
    const { id } = req.params;
    try {
        const admin = await Admin.findByIdAndUpdate(id, { isApproved: true }, { new: true });
        if (!admin) return res.status(404).json({ message: 'Admin not found' });
        setImmediate(() => {
            sendApprovalEmail(admin.email, admin.name).catch(err => console.error('Email send failed', err));
        });
        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const rejectAdmin = async (req, res) => {
    const { id } = req.params;
    try {
        const admin = await Admin.findById(id);
        if (!admin) return res.status(404).json({ message: 'Admin not found' });
        setImmediate(() => {
            sendRejectionEmail(admin.email, admin.name).catch(err => console.error('Email send failed', err));
        });
        await Admin.findByIdAndDelete(id);
        res.status(200).json({ message: 'Admin rejected and removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const approveAllTeachers = async (req, res) => {
    try {
        await Teacher.updateMany({ isApproved: false }, { $set: { isApproved: true } });
        res.status(200).json({ message: 'All pending teachers approved successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const approveAllStudents = async (req, res) => {
    try {
        await Student.updateMany({ isApproved: false }, { $set: { isApproved: true } });
        res.status(200).json({ message: 'All pending students approved successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const approveAllAdmins = async (req, res) => {
    try {
        await Admin.updateMany({ isApproved: false }, { $set: { isApproved: true } });
        res.status(200).json({ message: 'All pending admins approved successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── User Management ──
const PROTECTED_ADMIN_EMAIL = 'manish1212@gmail.com';

const getAllStudents = async (req, res) => {
    try {
        const students = await Student.find({}, '-password');
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find({}, '-password');
        res.status(200).json(teachers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find({}, '-password');
        res.status(200).json(admins);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    const { id, role } = req.params;
    try {
        let user, Model;
        if (role === 'student') Model = Student;
        else if (role === 'teacher') Model = Teacher;
        else if (role === 'admin') Model = Admin;
        else return res.status(400).json({ message: 'Invalid role' });

        user = await Model.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Protect default admin from deletion
        if (role === 'admin' && user.email === PROTECTED_ADMIN_EMAIL) {
            return res.status(403).json({ message: 'This admin account cannot be deleted.' });
        }

        await Model.findByIdAndDelete(id);
        res.status(200).json({ message: `${role} deleted successfully` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUser = async (req, res) => {
    const { id, role } = req.params;
    const { name, email, password, fatherName, motherName, course, branch } = req.body;
    try {
        let Model;
        if (role === 'student') Model = Student;
        else if (role === 'teacher') Model = Teacher;
        else if (role === 'admin') Model = Admin;
        else return res.status(400).json({ message: 'Invalid role' });

        const user = await Model.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check for email conflict with another user
        if (email && email !== user.email) {
            const existing = await Model.findOne({ email });
            if (existing) return res.status(400).json({ message: 'Email already in use' });
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (password) user.password = password;
        if (role === 'student') {
            if (fatherName !== undefined) user.fatherName = fatherName;
            if (motherName !== undefined) user.motherName = motherName;
            if (course !== undefined) user.course = course;
            if (branch !== undefined) user.branch = branch;
        }

        await user.save();
        user.password = undefined;
        res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getStats,
    getPendingTeachers,
    getPendingStudents,
    approveTeacher,
    rejectTeacher,
    approveStudent,
    rejectStudent,
    getPendingAdmins,
    getActiveAdmins,
    approveAdmin,
    rejectAdmin,
    approveAllTeachers,
    approveAllStudents,
    approveAllAdmins,
    getAllStudents,
    getAllTeachers,
    getAllAdmins,
    deleteUser,
    updateUser
};
