const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, forgotPassword, getSecurityQuestions, getUsers } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/get-security-questions', getSecurityQuestions);
router.get('/profile', protect, getUserProfile);
router.get('/users', protect, admin, getUsers);

module.exports = router;
