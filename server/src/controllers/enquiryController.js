const Enquiry = require('../models/Enquiry');
const SiteSettings = require('../models/SiteSettings');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { formatEnquiryMessage } = require('../utils/whatsapp');
const bot = require('../services/whatsappBot');

exports.getAll = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const total = await Enquiry.countDocuments(filter);
    const enquiries = await Enquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return sendPaginated(res, enquiries, total, Number(page), Number(limit));
  } catch (error) {
    return sendError(res, error.message);
  }
};

exports.create = async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;
    if (!name || !phone) {
      return sendError(res, 'Name and phone are required', 400);
    }
    const enquiry = await Enquiry.create({ name, phone, email, message });
    const whatsappMessage = formatEnquiryMessage(enquiry);

    bot.sendMessageToOwner(whatsappMessage, phone);

    return sendSuccess(res, { enquiry }, 'Enquiry submitted', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['new', 'read', 'replied'];
    if (!valid.includes(status)) {
      return sendError(res, 'Invalid status', 400);
    }
    const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!enquiry) return sendError(res, 'Enquiry not found', 404);
    return sendSuccess(res, { enquiry }, 'Enquiry status updated');
  } catch (error) {
    return sendError(res, error.message);
  }
};

exports.remove = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) return sendError(res, 'Enquiry not found', 404);
    return sendSuccess(res, null, 'Enquiry deleted');
  } catch (error) {
    return sendError(res, error.message);
  }
};
