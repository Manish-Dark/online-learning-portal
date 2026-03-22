const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { 
    getStudents, 
    updateStudent, 
    deleteStudent,
    getPendingStudents,
    approveStudent,
    rejectStudent,
    approveAllStudents
} = require('../controllers/teacher');

// All these routes require authentication. We can rely on `auth` middleware
// since only teachers (or admins) will call these via the teacher dashboard.
// (You could add a specific teacherCheck middleware if you wanted stricter roles).

router.get('/students', auth, getStudents);
router.get('/students/pending', auth, getPendingStudents);
router.put('/students/approve-all', auth, approveAllStudents);
router.put('/students/:id/approve', auth, approveStudent);
router.put('/students/:id/reject', auth, rejectStudent);
router.put('/students/:id', auth, updateStudent);
router.delete('/students/:id', auth, deleteStudent);

module.exports = router;
