const express = require('express');
const { createLesson, getLessons } = require('../controllers/lesson');
const { auth, teacherLimit } = require('../middleware/auth');

const router = express.Router();

router.get('/:courseId', getLessons);
router.post('/', auth, teacherLimit, createLesson);

module.exports = router;
