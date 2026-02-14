const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { name, email, password, role, course, branch, fatherName, motherName } = req.body;
        let Model;
        if (role === 'student') Model = Student;
        else if (role === 'teacher') Model = Teacher;
        else if (role === 'admin') Model = Admin;
        else return res.status(400).json({ message: 'Invalid role' });

        const existingUser = await Model.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        // isApproved is FALSE for everyone by default (Student & Teacher), requiring Admin approval.
        // Admin is auto-approved if they manage to register via this route (though typically seeded).
        const isApproved = role === 'admin' ? true : false;

        const user = new Model({
            name,
            email,
            password: password,
            isApproved,
            course, // Save course
            branch,  // Save branch (optional in schema, but passed if present)
            fatherName,
            motherName
        });

        await user.save();

        if (!isApproved) {
            return res.status(201).json({
                result: { name, email, role, isApproved },
                message: "Registration successful. Please wait for admin approval."
            });
        }

        const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ result: user, token });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!role) return res.status(400).json({ message: 'Role is required' });
        const normalizedRole = role.toLowerCase();

        let Model;
        if (normalizedRole === 'student') Model = Student;
        else if (normalizedRole === 'teacher') Model = Teacher;
        else if (normalizedRole === 'admin') Model = Admin;
        else return res.status(400).json({ message: 'Invalid role' }); // Or search all

        const user = await Model.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        let isPasswordCorrect = false;

        // Direct comparison for ALL roles (Plain text)
        if (user.password === password) {
            isPasswordCorrect = true;
        } else {
            isPasswordCorrect = false;
        }

        if (!isPasswordCorrect) return res.status(400).json({ message: 'Invalid credentials' });

        if (normalizedRole !== 'admin' && user.isApproved === false) {
            return res.status(403).json({ message: 'Account not approved yet. Please wait for admin approval.' });
        }

        const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ result: user, token });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

const getMe = async (req, res) => {
    try {
        const userId = req.userId;
        const role = req.userRole;

        let user;
        if (role === 'student') {
            user = await Student.findById(userId).populate({
                path: 'progress.quizScores.quizId',
                select: 'title questions'
            });
        } else if (role === 'teacher') {
            user = await Teacher.findById(userId);
        } else if (role === 'admin') {
            user = await Admin.findById(userId);
        }

        if (!user) return res.status(404).json({ message: 'User not found' });

        // sanitize password
        user.password = undefined;

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
};

module.exports = { register, login, getMe };
