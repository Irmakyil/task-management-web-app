const User = require('../models/User');
const bcrypt = require('bcrypt');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('express-async-handler');

// @desc Register a new user
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400); throw new Error('Please fill in all fields');
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400); throw new Error('User with this email already exists');
  }
  const user = await User.create({ name, email, password });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      token: generateToken(user._id, user.name, user.email, user.avatar), 
    });
  } else {
    res.status(400); throw new Error('Invalid user data');
  }
});

// @desc Authenticate user & get token (Login)
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || 'Bear',
      token: generateToken(user._id, user.name, user.email, user.avatar || 'Bear'), 
    });
  } else {
    res.status(401); throw new Error('Invalid email or password');
  }
});

// @desc Get current user's profile
const getUserProfile = asyncHandler(async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    avatar: req.user.avatar || 'Bear',
  });
});

// @desc Update user profile (name and avatar)
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.name = req.body.name || user.name;
    user.avatar = req.body.avatar || user.avatar;
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar || 'Bear',
      token: generateToken(updatedUser._id, updatedUser.name, updatedUser.email, updatedUser.avatar || 'Bear'), 
    });
  } else {
    res.status(404); throw new Error('User not found');
  }
});

// @desc Update user password
const updateUserPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400); throw new Error('Please provide both current and new passwords');
  }
  if (newPassword.length < 6) {
     res.status(400); throw new Error('New password must be at least 6 characters long');
  }
  const user = await User.findById(req.user._id);
  if (user && (await bcrypt.compare(currentPassword, user.password))) {
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } else {
    res.status(401); throw new Error('Invalid current password');
  }
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
};