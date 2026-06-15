const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Please provide your phone number'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['customer', 'admin', 'technician'],
      default: 'customer',
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    securityQuestions: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
    profileImage: {
      type: String,
      default: 'default-profile.png', // Or cloudinary URL
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving
userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  if (this.isModified('securityQuestions')) {
    for (const sq of this.securityQuestions) {
      if (sq.answer && !sq.answer.startsWith('$2a$') && !sq.answer.startsWith('$2b$')) {
        const salt = await bcrypt.genSalt(10);
        sq.answer = await bcrypt.hash(sq.answer, salt);
      }
    }
  }
});

// Method to check if entered password matches hashed password in DB
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to check a security answer
userSchema.methods.matchSecurityAnswer = async function (questionIndex, enteredAnswer) {
  if (!this.securityQuestions[questionIndex]) return false;
  return await bcrypt.compare(enteredAnswer, this.securityQuestions[questionIndex].answer);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
