const bot = require('../services/whatsappBot');
const { sendSuccess, sendError } = require('../utils/response');
const logger = console;

exports.getStatus = (req, res) => {
  const s = bot.getStatus();
  return sendSuccess(res, {
    status: s.status,
    qrCode: s.status === 'qr_ready' ? s.qrCode : null,
    hasAuth: s.hasAuth,
    lastError: s.lastError,
    lastErrorAt: s.lastErrorAt,
    retryCount: s.retryCount,
  });
};

exports.start = async (req, res) => {
  try {
    if (bot.status === 'connected') {
      return sendSuccess(res, { status: bot.status }, 'Already connected');
    }
    bot.connect();
    return sendSuccess(res, { status: 'connecting' }, 'WhatsApp bot starting');
  } catch (err) {
    return sendError(res, err.message);
  }
};

exports.disconnect = (req, res) => {
  bot.disconnect();
  return sendSuccess(res, null, 'Bot disconnected');
};

exports.clearAuth = async (req, res) => {
  try {
    await bot.clearAuth();
    return sendSuccess(res, null, 'Auth cleared. Scan QR to reconnect.');
  } catch (err) {
    return sendError(res, err.message);
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { phone, message } = req.body;
    if (!phone || !message) {
      return sendError(res, 'Phone and message are required', 400);
    }
    await bot.sendMessage(phone, message);
    return sendSuccess(res, null, 'Message sent');
  } catch (err) {
    return sendError(res, err.message);
  }
};
