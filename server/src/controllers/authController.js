const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { sendSuccess, sendError } = require('../utils/response');

const generateToken = (admin) => {
  return jwt.sign(
    { id: admin._id, email: admin.email, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400);
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return sendError(res, 'Invalid credentials', 401);
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials', 401);
    }

    const token = generateToken(admin);
    return sendSuccess(res, {
      token,
      admin: admin.toJSON(),
    }, 'Login successful');
  } catch (error) {
    return sendError(res, error.message);
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return sendError(res, 'Name, email and password are required', 400);
    }
    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters', 400);
    }

    const exists = await Admin.findOne({ email: email.toLowerCase() });
    if (exists) {
      return sendError(res, 'Admin with this email already exists', 400);
    }

    const admin = await Admin.create({
      name,
      email,
      password,
      role: role || 'admin',
    });

    const token = generateToken(admin);
    return sendSuccess(res, {
      token,
      admin: admin.toJSON(),
    }, 'Admin created successfully', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

exports.getMe = async (req, res) => {
  return sendSuccess(res, { admin: req.admin });
};

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select('-password');
    return sendSuccess(res, { admins });
  } catch (error) {
    return sendError(res, error.message);
  }
};
