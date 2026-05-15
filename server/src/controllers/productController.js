const Product = require('../models/Product');
const SiteSettings = require('../models/SiteSettings');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

exports.getAll = async (req, res) => {
  try {
    const { category, search, featured, trending, visible, page = 1, limit = 20 } = req.query;
    const filter = {};

    const settings = await SiteSettings.findOne();
    if (settings && settings.hiddenSections?.length) {
      const hiddenCategories = settings.hiddenSections;
      if (!req.admin) {
        filter.category = { $nin: hiddenCategories };
      }
    }

    if (category) {
      const Category = require('../models/Category');
      const catDoc = await Category.findOne({ slug: category });
      if (catDoc) {
        const catId = catDoc._id;
        if (filter.category && filter.category.$nin) {
          filter.category = { $in: [catId], $nin: filter.category.$nin };
        } else {
          filter.category = catId;
        }
      }
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }
    if (featured === 'true') filter.featured = true;
    if (trending === 'true') filter.trending = true;
    if (visible === 'true') filter.visible = true;
    if (!req.admin && !visible) filter.visible = true;

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return sendPaginated(res, products, total, Number(page), Number(limit));
  } catch (error) {
    return sendError(res, error.message);
  }
};

exports.getBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('category', 'name slug');
    if (!product) {
      return sendError(res, 'Product not found', 404);
    }
    return sendSuccess(res, { product });
  } catch (error) {
    return sendError(res, error.message);
  }
};

exports.getById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug');
    if (!product) {
      return sendError(res, 'Product not found', 404);
    }
    return sendSuccess(res, { product });
  } catch (error) {
    return sendError(res, error.message);
  }
};

exports.create = async (req, res) => {
  try {
    const data = req.body;
    if (!data.slug) {
      data.slug = generateSlug(data.name) + '-' + Date.now();
    }
    const product = await Product.create(data);
    return sendSuccess(res, { product }, 'Product created', 201);
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 'Product with this slug already exists', 400);
    }
    return sendError(res, error.message);
  }
};

exports.update = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return sendError(res, 'Product not found', 404);
    }
    return sendSuccess(res, { product }, 'Product updated');
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 'Product with this slug already exists', 400);
    }
    return sendError(res, error.message);
  }
};

exports.remove = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return sendError(res, 'Product not found', 404);
    }
    return sendSuccess(res, null, 'Product deleted');
  } catch (error) {
    return sendError(res, error.message);
  }
};
