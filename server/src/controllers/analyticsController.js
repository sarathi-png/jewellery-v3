const Product = require('../models/Product');
const Order = require('../models/Order');
const Category = require('../models/Category');
const { sendSuccess, sendError } = require('../utils/response');

exports.getStockOverview = async (req, res) => {
  try {
    const [catAggregation, soldAggregation] = await Promise.all([
      Product.aggregate([
        { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'cat' } },
        { $unwind: { path: '$cat', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: '$cat._id',
            categoryName: { $first: '$cat.name' },
            categorySlug: { $first: '$cat.slug' },
            totalStock: { $sum: '$stock' },
            productCount: { $sum: 1 },
            products: {
              $push: {
                _id: '$_id', name: '$name', stock: '$stock',
                price: '$price', comparePrice: '$comparePrice',
              },
            },
          },
        },
        { $sort: { categoryName: 1 } },
      ]),
      Order.aggregate([
        { $match: { status: { $in: ['delivered', 'confirmed', 'shipped'] } } },
        { $unwind: '$items' },
        {
          $lookup: { from: 'products', localField: 'items.productId', foreignField: '_id', as: 'prod' },
        },
        { $unwind: { path: '$prod', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: '$prod.category',
            totalSold: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
          },
        },
      ]),
    ]);

    const soldMap = {};
    for (const s of soldAggregation) {
      soldMap[String(s._id)] = { totalSold: s.totalSold, totalRevenue: s.totalRevenue };
    }

    const categories = [];
    let grandTotalStock = 0;
    let grandTotalSold = 0;

    for (const cat of catAggregation) {
      const key = String(cat._id);
      const sold = soldMap[key] || { totalSold: 0, totalRevenue: 0 };
      const totalSold = sold.totalSold || 0;
      const totalPurchased = cat.totalStock + totalSold;
      grandTotalStock += cat.totalStock;
      grandTotalSold += totalSold;

      categories.push({
        _id: cat._id,
        categoryName: cat.categoryName || 'Uncategorized',
        categorySlug: cat.categorySlug || '',
        productCount: cat.productCount,
        totalStock: cat.totalStock,
        totalSold,
        totalPurchased,
        totalRevenue: sold.totalRevenue || 0,
      });
    }

    return sendSuccess(res, { categories, grandTotalStock, grandTotalSold });
  } catch (error) {
    return sendError(res, error.message);
  }
};

exports.getTopSellers = async (req, res) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year = parseInt(req.query.year) || now.getFullYear();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const topSellers = await Order.aggregate([
      { $match: { status: 'delivered', createdAt: { $gte: startDate, $lte: endDate } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.name' },
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 20 },
      {
        $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $lookup: { from: 'categories', localField: 'product.category', foreignField: '_id', as: 'category' },
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          productName: 1, totalSold: 1, revenue: 1,
          remainingStock: '$product.stock',
          categoryName: '$category.name',
        },
      },
    ]);

    return sendSuccess(res, { topSellers, month, year });
  } catch (error) {
    return sendError(res, error.message);
  }
};

exports.getUnsoldProducts = async (req, res) => {
  try {
    const soldProductIds = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $unwind: '$items' },
      { $group: { _id: '$items.productId' } },
    ]);

    const soldIds = soldProductIds.map(p => p._id).filter(Boolean);

    const unsold = await Product.find({
      _id: { $nin: soldIds },
      visible: true,
    })
      .populate('category', 'name slug')
      .sort({ stock: -1 });

    return sendSuccess(res, { unsold, count: unsold.length });
  } catch (error) {
    return sendError(res, error.message);
  }
};

exports.getDetailedAnalysis = async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const monthStart = new Date(currentYear, currentMonth - 1, 1);
    const monthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    const [products, salesData, monthlySales] = await Promise.all([
      Product.find({ visible: true }).populate('category', 'name slug').lean(),
      Order.aggregate([
        { $match: { status: 'delivered' } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            totalSold: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
          },
        },
      ]),
      Order.aggregate([
        { $match: { status: 'delivered', createdAt: { $gte: monthStart, $lte: monthEnd } } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            monthlySold: { $sum: '$items.quantity' },
            monthlyRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
          },
        },
      ]),
    ]);

    const salesMap = {};
    for (const s of salesData) salesMap[String(s._id)] = s;
    const monthlyMap = {};
    for (const m of monthlySales) monthlyMap[String(m._id)] = m;

    const valueForMoney = [];
    const notValueForMoney = [];
    const futureDemand = [];
    const wasteToBuy = [];

    for (const p of products) {
      const pid = String(p._id);
      const allTime = salesMap[pid] || { totalSold: 0, totalRevenue: 0 };
      const monthly = monthlyMap[pid] || { monthlySold: 0, monthlyRevenue: 0 };
      const discountPct = p.comparePrice > p.price
        ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100)
        : 0;

      const item = {
        _id: p._id,
        name: p.name,
        category: p.category?.name || 'Uncategorized',
        price: p.price,
        comparePrice: p.comparePrice,
        stock: p.stock,
        totalSold: allTime.totalSold,
        monthlySold: monthly.monthlySold,
        discountPct,
      };

      if (discountPct >= 15 && allTime.totalSold > 0) {
        valueForMoney.push({ ...item, reason: `${discountPct}% discount with ${allTime.totalSold} units sold` });
      }

      if (discountPct < 5 && allTime.totalSold === 0) {
        notValueForMoney.push({ ...item, reason: `Minimal discount (${discountPct}%) with zero sales` });
      }

      if (monthly.monthlySold >= 2 && p.stock <= monthly.monthlySold * 2) {
        futureDemand.push({ ...item, reason: `Selling ${monthly.monthlySold}/mo with only ${p.stock} left` });
      }

      if (p.stock >= 10 && allTime.totalSold === 0) {
        wasteToBuy.push({ ...item, reason: `${p.stock} units in stock with zero sales` });
      }
    }

    valueForMoney.sort((a, b) => b.discountPct - a.discountPct);
    notValueForMoney.sort((a, b) => a.price - b.price);
    futureDemand.sort((a, b) => (b.monthlySold / Math.max(b.stock, 1)) - (a.monthlySold / Math.max(a.stock, 1)));
    wasteToBuy.sort((a, b) => b.stock - a.stock);

    return sendSuccess(res, {
      valueForMoney: valueForMoney.slice(0, 20),
      notValueForMoney: notValueForMoney.slice(0, 20),
      futureDemand: futureDemand.slice(0, 20),
      wasteToBuy: wasteToBuy.slice(0, 20),
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return sendError(res, error.message);
  }
};
