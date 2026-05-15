const Banner = require('../models/Banner');
const { sendSuccess, sendError } = require('../utils/response');

exports.getAll = async (req, res) => {
  try {
    const filter = {};
    if (!req.admin) filter.active = true;
    const banners = await Banner.find(filter).sort({ order: 1 });
    return sendSuccess(res, { banners });
  } catch (error) {
    return sendError(res, error.message);
  }
};

exports.create = async (req, res) => {
  try {
    const banner = await Banner.create(req.body);
    return sendSuccess(res, { banner }, 'Banner created', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

exports.update = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!banner) return sendError(res, 'Banner not found', 404);
    return sendSuccess(res, { banner }, 'Banner updated');
  } catch (error) {
    return sendError(res, error.message);
  }
};

exports.remove = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return sendError(res, 'Banner not found', 404);
    return sendSuccess(res, null, 'Banner deleted');
  } catch (error) {
    return sendError(res, error.message);
  }
};
