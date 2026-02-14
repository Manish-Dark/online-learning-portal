const express = require('express');
const { register, login } = require('../controllers/auth');

const router = express.Router();

const { auth } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, require('../controllers/auth').getMe);

module.exports = router;
