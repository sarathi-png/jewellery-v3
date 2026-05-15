const Order = require('../models/Order');
const SiteSettings = require('../models/SiteSettings');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { formatOrderMessage } = require('../utils/whatsapp');
const bot = require('../services/whatsappBot');

exports.getAll = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return sendPaginated(res, orders, total, Number(page), Number(limit));
  } catch (error) {
    return sendError(res, error.message);
  }
};

exports.getById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return sendError(res, 'Order not found', 404);
    return sendSuccess(res, { order });
  } catch (error) {
    return sendError(res, error.message);
  }
};

exports.create = async (req, res) => {
  try {
    const { customerName, phone, address, notes, items } = req.body;
    if (!customerName || !phone || !items || !items.length) {
      return sendError(res, 'Customer name, phone, and items are required', 400);
    }

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await Order.create({
      customerName,
      phone,
      address,
      notes,
      items,
      totalAmount,
    });

    const message = formatOrderMessage(order);

    bot.sendMessageToOwner(message, order.phone);

    return sendSuccess(res, { order }, 'Order placed', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!valid.includes(status)) {
      return sendError(res, 'Invalid status', 400);
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return sendError(res, 'Order not found', 404);
    return sendSuccess(res, { order }, 'Order status updated');
  } catch (error) {
    return sendError(res, error.message);
  }
};

exports.exportExcel = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();

    const XLSX = require('xlsx');
    const data = orders.map(o => ({
      'Order ID': o._id.toString(),
      'Customer Name': o.customerName,
      'Phone': o.phone,
      'Address': o.address || '',
      'Items': o.items.map(i => `${i.name} x${i.quantity}`).join(', '),
      'Total Amount': o.totalAmount,
      'Status': o.status,
      'Date': o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : '',
      'Notes': o.notes || '',
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=orders-${status || 'all'}-${Date.now()}.xlsx`);
    res.send(buf);
  } catch (error) {
    return sendError(res, error.message);
  }
};

exports.remove = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return sendError(res, 'Order not found', 404);
    return sendSuccess(res, null, 'Order deleted');
  } catch (error) {
    return sendError(res, error.message);
  }
};
