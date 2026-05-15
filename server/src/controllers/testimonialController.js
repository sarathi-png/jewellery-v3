const Testimonial = require('../models/Testimonial');
const { sendSuccess, sendError } = require('../utils/response');

exports.getAll = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ verified: true }).sort({ createdAt: -1 });
    return sendSuccess(res, { testimonials });
  } catch (error) {
    return sendError(res, error.message);
  }
};

exports.getAllAdmin = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    return sendSuccess(res, { testimonials });
  } catch (error) {
    return sendError(res, error.message);
  }
};

exports.createPublic = async (req, res) => {
  try {
    const { customerName, location, rating, review } = req.body;
    if (!customerName || !review) {
      return sendError(res, 'Name and review are required', 400);
    }
    const testimonial = await Testimonial.create({
      customerName,
      location: location || '',
      rating: rating || 5,
      review,
      verified: false,
    });
    return sendSuccess(res, { testimonial }, 'Testimonial submitted for review', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

exports.create = async (req, res) => {
  try {
    const testimonial = await Testimonial.create(req.body);
    return sendSuccess(res, { testimonial }, 'Testimonial created', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

exports.update = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!testimonial) return sendError(res, 'Testimonial not found', 404);
    return sendSuccess(res, { testimonial }, 'Testimonial updated');
  } catch (error) {
    return sendError(res, error.message);
  }
};

exports.remove = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) return sendError(res, 'Testimonial not found', 404);
    return sendSuccess(res, null, 'Testimonial deleted');
  } catch (error) {
    return sendError(res, error.message);
  }
};
