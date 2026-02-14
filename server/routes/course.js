const express = require('express');
const { getCourses, createCourse, getCourse } = require('../controllers/course');
const { auth, teacherLimit } = require('../middleware/auth');

const router = express.Router();

router.get('/', getCourses);
router.get('/:id', getCourse);
router.post('/', auth, teacherLimit, createCourse);

module.exports = router;
