const formatOrderMessage = (order) => {
  let message = '*📦 New Order Placed*\n';
  message += '━━━━━━━━━━━━━━━━━━\n';
  message += `*👤 Customer:* ${order.customerName}\n`;
  message += `*📞 Phone:* ${order.phone}\n`;
  if (order.address) message += `*📍 Address:* ${order.address}\n\n`;

  message += '*🛒 Items:*\n';
  order.items.forEach((item, index) => {
    message += `${index + 1}. ${item.name} × ${item.quantity} — ₹${(item.price * item.quantity).toLocaleString('en-IN')}\n`;
  });

  message += '\n━━━━━━━━━━━━━━━━━━\n';
  message += `*💰 Total: ₹${order.totalAmount.toLocaleString('en-IN')}*\n`;
  if (order.notes) message += `*📝 Notes:* ${order.notes}\n`;

  return message;
};

const formatEnquiryMessage = (enquiry) => {
  let message = '*📩 New Enquiry Received*\n';
  message += '━━━━━━━━━━━━━━━\n';
  message += `*👤 Name:* ${enquiry.name}\n`;
  message += `*📞 Phone:* ${enquiry.phone}\n`;
  if (enquiry.email) message += `*📧 Email:* ${enquiry.email}\n`;
  if (enquiry.message) message += `\n*💬 Message:* ${enquiry.message}\n`;
  return message;
};

module.exports = { formatOrderMessage, formatEnquiryMessage };
