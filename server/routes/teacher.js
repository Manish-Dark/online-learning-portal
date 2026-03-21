const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getStudents, updateStudent, deleteStudent } = require('../controllers/teacher');

// All these routes require authentication. We can rely on `auth` middleware
// since only teachers (or admins) will call these via the teacher dashboard.
// (You could add a specific teacherCheck middleware if you wanted stricter roles).

router.get('/students', auth, getStudents);
router.put('/students/:id', auth, updateStudent);
router.delete('/students/:id', auth, deleteStudent);

module.exports = router;
