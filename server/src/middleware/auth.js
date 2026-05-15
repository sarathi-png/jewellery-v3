const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.admin && req.admin.role === 'super_admin') {
    return next();
  }
  return res.status(403).json({ message: 'Admin access required' });
};

module.exports = { authenticate, adminOnly };
