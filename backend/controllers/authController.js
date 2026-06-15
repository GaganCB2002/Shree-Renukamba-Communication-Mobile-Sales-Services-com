const User = require('../models/User');
const Customer = require('../models/Customer');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { fullName, phoneNumber, email, password, role, securityQuestions } = req.body;

    if (!securityQuestions || securityQuestions.length < 3) {
      return res.status(400).json({ message: 'Please provide all 3 security questions and answers' });
    }

    const userExists = await User.findOne({ $or: [{ email }, { phoneNumber }] });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const userRole = role && ['admin', 'technician'].includes(role) ? role : 'customer';

    const user = await User.create({
      fullName,
      phoneNumber,
      email,
      password,
      role: userRole,
      securityQuestions,
    });

    if (user) {
      // If customer, create customer profile
      if (user.role === 'customer') {
        await Customer.create({ userId: user._id });
      }

      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        address: user.address,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot password - verify security question
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email, questionIndex, answer, newPassword } = req.body;

    if (!email || questionIndex === undefined || !answer || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.securityQuestions || user.securityQuestions.length < 3) {
      return res.status(400).json({ message: 'No security questions set for this account' });
    }

    const isValid = await user.matchSecurityAnswer(questionIndex, answer);
    if (!isValid) {
      return res.status(401).json({ message: 'Incorrect answer' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully. You can now login with your new password.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get security questions for a user (by email)
// @route   POST /api/auth/get-security-questions
// @access  Public
const getSecurityQuestions = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.securityQuestions || user.securityQuestions.length < 3) {
      return res.status(400).json({ message: 'No security questions set for this account' });
    }

    const questions = user.securityQuestions.map((sq, idx) => ({
      index: idx,
      question: sq.question,
    }));

    // Pick a random question for the user to answer
    const randomIdx = Math.floor(Math.random() * questions.length);

    res.json({
      questions,
      askIndex: randomIdx,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/auth/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('fullName email phoneNumber');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  forgotPassword,
  getSecurityQuestions,
  getUsers,
};
