const { sendSuccess, sendError } = require('../utils/response');

exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return sendError(res, 'No files uploaded', 400);
    }
    const urls = req.files.map((file) => `/uploads/${file.filename}`);
    return sendSuccess(res, { urls }, 'Files uploaded', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

exports.uploadSingle = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 'No file uploaded', 400);
    }
    return sendSuccess(res, { url: `/uploads/${req.file.filename}` }, 'File uploaded', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};
