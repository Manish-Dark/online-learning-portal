const express = require('express');
const { createQuiz, getQuizzes, getQuiz, submitQuiz } = require('../controllers/quiz');
const { auth, teacherLimit } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, teacherLimit, createQuiz);
router.get('/', auth, getQuizzes); // New route for general fetching with query params
router.get('/course/:courseId', auth, getQuizzes); // Existing route
router.get('/:id', auth, getQuiz);
router.post('/submit', auth, submitQuiz);
router.delete('/:id', auth, teacherLimit, require('../controllers/quiz').deleteQuiz);
router.get('/:id/results', auth, teacherLimit, require('../controllers/quiz').getQuizResults);

module.exports = router;
