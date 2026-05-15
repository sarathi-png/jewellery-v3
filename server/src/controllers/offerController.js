const Offer = require('../models/Offer');
const { sendSuccess, sendError } = require('../utils/response');

exports.getAll = async (req, res) => {
  try {
    const filter = {};
    if (!req.admin) filter.active = true;
    const offers = await Offer.find(filter).sort({ createdAt: -1 });
    return sendSuccess(res, { offers });
  } catch (error) {
    return sendError(res, error.message);
  }
};

exports.create = async (req, res) => {
  try {
    const offer = await Offer.create(req.body);
    return sendSuccess(res, { offer }, 'Offer created', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

exports.update = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!offer) return sendError(res, 'Offer not found', 404);
    return sendSuccess(res, { offer }, 'Offer updated');
  } catch (error) {
    return sendError(res, error.message);
  }
};

exports.remove = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) return sendError(res, 'Offer not found', 404);
    return sendSuccess(res, null, 'Offer deleted');
  } catch (error) {
    return sendError(res, error.message);
  }
};
