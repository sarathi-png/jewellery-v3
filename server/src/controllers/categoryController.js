const Category = require('../models/Category');
const Product = require('../models/Product');
const SiteSettings = require('../models/SiteSettings');
const { sendSuccess, sendError } = require('../utils/response');

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

exports.getAll = async (req, res) => {
  try {
    const filter = {};
    const settings = await SiteSettings.findOne();
    const hiddenSections = settings?.hiddenSections || [];
    const showAll = req.query.all === 'true';

    if (!showAll) {
      filter.visible = true;
    }

    let categories = await Category.find(filter)
      .sort({ order: 1, name: 1 });

    if (!showAll && hiddenSections.length) {
      categories = categories.filter(c => !hiddenSections.includes(c.slug));
    }

    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const productCount = await Product.countDocuments({ category: cat._id, visible: true });
        return {
          ...cat.toObject(),
          productCount,
          hidden: hiddenSections.includes(cat.slug),
        };
      })
    );

    return sendSuccess(res, { categories: categoriesWithCount });
  } catch (error) {
    return sendError(res, error.message);
  }
};

exports.getBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return sendError(res, 'Category not found', 404);
    }
    return sendSuccess(res, { category });
  } catch (error) {
    return sendError(res, error.message);
  }
};

exports.create = async (req, res) => {
  try {
    const data = req.body;
    if (!data.slug) {
      data.slug = generateSlug(data.name);
    }
    const category = await Category.create(data);
    return sendSuccess(res, { category }, 'Category created', 201);
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 'Category with this slug already exists', 400);
    }
    return sendError(res, error.message);
  }
};

exports.update = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      return sendError(res, 'Category not found', 404);
    }
    return sendSuccess(res, { category }, 'Category updated');
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 'Category with this slug already exists', 400);
    }
    return sendError(res, error.message);
  }
};

exports.remove = async (req, res) => {
  try {
    const productCount = await Product.countDocuments({ category: req.params.id });
    if (productCount > 0) {
      return sendError(res, `Cannot delete: ${productCount} products use this category`, 400);
    }
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return sendError(res, 'Category not found', 404);
    }
    return sendSuccess(res, null, 'Category deleted');
  } catch (error) {
    return sendError(res, error.message);
  }
};
