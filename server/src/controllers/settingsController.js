const SiteSettings = require('../models/SiteSettings');
const { sendSuccess, sendError } = require('../utils/response');

exports.get = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({});
    }
    return sendSuccess(res, { settings });
  } catch (error) {
    return sendError(res, error.message);
  }
};

exports.update = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }
    return sendSuccess(res, { settings }, 'Settings updated');
  } catch (error) {
    return sendError(res, error.message);
  }
};
