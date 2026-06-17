const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  googleLogin,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  resendOtp,
  forgotPassword,
  getSecurityQuestions,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAllCustomers,
  getGoogleClientId,
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');
const { loginRateLimiter } = require('../middleware/rateLimiter');

router.route('/register').post(loginRateLimiter, registerUser);
router.route('/login').post(loginRateLimiter, loginUser);
router.route('/google').post(loginRateLimiter, googleLogin);
router.route('/google-client-id').get(getGoogleClientId);
router.route('/logout').post(protect, logoutUser);
router.route('/forgot-password').post(forgotPassword);
router.route('/get-security-questions').post(getSecurityQuestions);
router.route('/resend-otp').post(resendOtp);
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.route('/change-password').put(protect, changePassword);
router.route('/users')
  .get(protect, admin, getUsers)
  .post(protect, admin, createUser);
router.route('/users/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);
router.route('/customers').get(protect, admin, getAllCustomers);

module.exports = router;
