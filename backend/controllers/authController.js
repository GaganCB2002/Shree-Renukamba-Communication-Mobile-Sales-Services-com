const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Customer = require('../models/Customer');
const { pool } = require('../config/db');
const generateToken = require('../utils/generateToken');
const { sendEmail } = require('../services/emailService');
const { sendEmailNodemailer } = require('../services/nodemailerService');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const userRole = role && ['admin', 'technician'].includes(role) ? role : 'customer';

    const user = await User.create({
      fullName,
      phoneNumber,
      email,
      password,
      role: userRole,
      securityQuestions,
      otp,
      otpExpires,
      passwordHistory: [password],
    });

    if (user) {
      if (user.role === 'customer') {
        await Customer.create({ userId: user._id });
      }

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #6366f1, #4f46e5); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 22px;">Welcome to SR Communication!</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; color: #374151;">Dear <strong>${fullName}</strong>,</p>
            <p style="font-size: 16px; color: #374151;">Your account has been created successfully.</p>
            <p style="font-size: 16px; color: #374151;">Your one-time OTP for login is:</p>
            <div style="background: #4f46e5; color: white; font-size: 32px; font-weight: 800; text-align: center; padding: 20px; border-radius: 8px; letter-spacing: 8px; font-family: monospace; margin: 20px 0;">
              ${otp}
            </div>
            <p style="font-size: 14px; color: #6b7280;">This OTP will be used every time you log in. Please keep it secure.</p>
            <p style="font-size: 14px; color: #374151;">Thank you for joining us!</p>
          </div>
        </div>
      `;

      try {
        await sendEmail({ to: email, subject: 'Welcome - Your OTP for Login', html: emailHtml });
      } catch {
        try {
          await sendEmailNodemailer({ to: email, subject: 'Welcome - Your OTP for Login', html: emailHtml });
        } catch (e2) {}
      }

      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
        otp,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (await user.matchPassword(password)) {
      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        address: user.address,
        token: generateToken(user._id),
      });
    } else {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Google account must have an email' });
    }

    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.findOne({ email });
    }

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = user.authProvider === 'email' ? 'both' : 'google';
      }
      if (!user.profileImage && picture) {
        user.profileImage = picture;
      }
      await user.save();
    } else {
      const defaultPassword = googleId + '_' + Date.now();
      user = await User.create({
        fullName: name || email.split('@')[0],
        email,
        password: defaultPassword,
        googleId,
        authProvider: 'google',
        profileImage: picture || '',
        role: 'customer',
      });

      await Customer.create({ userId: user._id });
    }

    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      address: user.address,
      profileImage: user.profileImage,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('[GoogleLogin] Error:', error.message);
    res.status(500).json({ message: 'Google authentication failed' });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      const customer = await Customer.findOne({ userId: user._id }).populate('devices').populate('repairHistory');
      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        address: user.address,
        profileImage: user.profileImage,
        customer: customer ? {
          _id: customer._id,
          devices: customer.devices,
          repairHistory: customer.repairHistory,
          loyaltyPoints: customer.loyaltyPoints,
        } : null,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { fullName, phoneNumber, address, profileImage } = req.body;
    if (fullName) user.fullName = fullName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (address) user.address = address;
    if (profileImage) user.profileImage = profileImage;

    const updated = await user.save();
    res.json({
      _id: updated._id,
      fullName: updated.fullName,
      email: updated.email,
      role: updated.role,
      phoneNumber: updated.phoneNumber,
      address: updated.address,
      profileImage: updated.profileImage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const passwordHistory = user.passwordHistory || [];

    for (const oldPw of passwordHistory.slice(-3)) {
      const isMatch = await require('bcryptjs').compare(newPassword, oldPw);
      if (isMatch) {
        return res.status(400).json({ message: 'New password must be different from your last 3 passwords' });
      }
    }

    passwordHistory.push(newPassword);

    if (passwordHistory.length > 10) {
      passwordHistory.splice(0, passwordHistory.length - 10);
    }

    user.password = newPassword;
    user.passwordHistory = passwordHistory;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select('+otp +otpExpires');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = user.otp || Math.floor(100000 + Math.random() * 900000).toString();
    if (!user.otp) {
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();
    }

    const otpHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6366f1, #4f46e5); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px;">Your OTP for Login</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb;">
          <p style="font-size: 16px; color: #374151;">Your one-time password for login is:</p>
          <div style="background: #4f46e5; color: white; font-size: 32px; font-weight: 800; text-align: center; padding: 20px; border-radius: 8px; letter-spacing: 8px; font-family: monospace; margin: 20px 0;">
            ${otp}
          </div>
          <p style="font-size: 14px; color: #6b7280;">This OTP is valid for 24 hours.</p>
        </div>
      </div>
    `;

    try {
      await sendEmail({ to: email, subject: 'Your OTP for Login - SR Communication', html: otpHtml });
    } catch {
      await sendEmailNodemailer({ to: email, subject: 'Your OTP for Login - SR Communication', html: otpHtml });
    }

    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

    const randomIdx = Math.floor(Math.random() * questions.length);

    res.json({
      questions,
      askIndex: randomIdx,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('fullName email phoneNumber role address createdAt');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single user by ID
// @route   GET /api/auth/users/:id
// @access  Private (Admin)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new user (admin)
// @route   POST /api/auth/users
// @access  Private (Admin)
const createUser = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, role, address } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Full name, email, and password are required' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }
    const user = await User.create({
      fullName,
      email,
      phoneNumber: phoneNumber || '',
      password,
      role: role || 'customer',
      address: address || {},
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update any user (admin)
// @route   PUT /api/auth/users/:id
// @access  Private (Admin)
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { fullName, email, phoneNumber, password, role, address } = req.body;
    if (fullName !== undefined) user.fullName = fullName;
    if (email !== undefined) user.email = email;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (password) user.password = password;
    if (role !== undefined) user.role = role;
    if (address !== undefined) user.address = address;
    const updated = await user.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a user (admin)
// @route   DELETE /api/auth/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role === 'admin') {
      const adminCount = (await User.find({ role: 'admin' })).length;
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last admin user' });
      }
    }
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ message: 'User removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({})
      .populate({
        path: 'userId',
        select: 'fullName email phoneNumber address createdAt role',
      })
      .populate('devices')
      .populate('repairHistory');

    const enriched = customers.filter(c => c.userId).map(c => ({
      _id: c._id,
      fullName: c.userId.fullName,
      email: c.userId.email,
      phoneNumber: c.userId.phoneNumber,
      address: c.userId.address,
      role: c.userId.role,
      createdAt: c.userId.createdAt,
      devicesCount: c.devices?.length || 0,
      repairsCount: c.repairHistory?.length || 0,
      loyaltyPoints: c.loyaltyPoints || 0,
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
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
};
