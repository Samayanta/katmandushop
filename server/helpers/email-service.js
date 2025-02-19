const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  generateCloudinaryUrl(url) {
    // If it's already a full URL, return it as is
    if (url && url.startsWith('http')) {
      return url;
    }
    // Otherwise, construct the Cloudinary URL
    return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/v1/${url}`;
  }

  generateItemsHtml(cartItems) {
    return cartItems.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <img src="${this.generateCloudinaryUrl(item.image)}" alt="${item.title}" style="width: 100px; height: auto;">
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${item.title}</strong><br>
          ${item.selectedColor !== 'default' ? `Color: ${item.selectedColor}<br>` : ''}
          ${item.selectedSize !== 'default' ? `Size: ${item.selectedSize}<br>` : ''}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          ${item.quantity}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          रू ${item.price}
        </td>
      </tr>
    `).join('');
  }

  generateAdminEmailHtml(orderData, customerEmail, userName) {
    const itemsHtml = this.generateItemsHtml(orderData.cartItems);
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Order Received - #${orderData._id}</h2>
        
        <h3>Customer Information:</h3>
        <p>
          Name: ${userName}<br>
          Email: ${customerEmail}<br>
          Phone: ${orderData.addressInfo.phone}
        </p>

        <h3>Shipping Address:</h3>
        <p>
          ${orderData.addressInfo.address}<br>
          ${orderData.addressInfo.city}, ${orderData.addressInfo.pincode}<br>
          Notes: ${orderData.addressInfo.notes || 'N/A'}
        </p>

        <h3>Order Details:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 10px; text-align: left;">Image</th>
              <th style="padding: 10px; text-align: left;">Product</th>
              <th style="padding: 10px; text-align: left;">Quantity</th>
              <th style="padding: 10px; text-align: left;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="margin-top: 20px; text-align: right;">
          <strong>Total Amount: रू ${orderData.totalAmount}</strong>
        </div>

        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
          <p>
            Payment Method: ${orderData.paymentMethod.charAt(0).toUpperCase() + orderData.paymentMethod.slice(1)}<br>
            Payment Status: <strong style="color: ${orderData.paymentStatus === 'paid' ? '#2ecc71' : '#e74c3c'}">${orderData.paymentStatus.toUpperCase()}</strong><br>
            Order Status: <strong style="color: ${orderData.orderStatus === 'confirmed' ? '#2ecc71' : '#f39c12'}">${orderData.orderStatus.toUpperCase()}</strong>
          </p>
        </div>
      </div>
    `;
  }

  generateClientEmailHtml(orderData, userName) {
    const itemsHtml = this.generateItemsHtml(orderData.cartItems);
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Order Confirmation - #${orderData._id}</h2>
        
        <p>Dear ${userName},</p>
        <p>Thank you for your order! Your order has been successfully placed and confirmed.</p>

        <h3>Order Details:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 10px; text-align: left;">Image</th>
              <th style="padding: 10px; text-align: left;">Product</th>
              <th style="padding: 10px; text-align: left;">Quantity</th>
              <th style="padding: 10px; text-align: left;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="margin-top: 20px; text-align: right;">
          <strong>Total Amount: रू ${orderData.totalAmount}</strong>
        </div>

        <h3>Shipping Address:</h3>
        <p>
          ${orderData.addressInfo.address}<br>
          ${orderData.addressInfo.city}, ${orderData.addressInfo.pincode}
        </p>

        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
          <p>
            Payment Status: <strong style="color: ${orderData.paymentStatus === 'paid' ? '#2ecc71' : '#e74c3c'}">${orderData.paymentStatus.toUpperCase()}</strong><br>
            Order Status: <strong style="color: ${orderData.orderStatus === 'confirmed' ? '#2ecc71' : '#f39c12'}">${orderData.orderStatus.toUpperCase()}</strong>
          </p>
        </div>

        <p style="margin-top: 20px;">
          We'll keep you updated on your order status. If you have any questions, please don't hesitate to contact us.
        </p>
      </div>
    `;
  }

  async sendOrderNotification(orderData, customerEmail, userName, isClientEmail = false) {

    const emailHtml = isClientEmail 
      ? this.generateClientEmailHtml(orderData, userName)
      : this.generateAdminEmailHtml(orderData, customerEmail, userName);

    const emailSubject = isClientEmail 
      ? `Order Confirmation - #${orderData._id}`
      : `New Order Received - #${orderData._id}`;

    await this.transporter.sendMail({
      from: isClientEmail 
        ? {
            name: 'KatmanduShop',
            address: process.env.SMTP_USER
          }
        : {
            name: 'KatmanduShop Admin',
            address: process.env.SMTP_USER
          },
      to: isClientEmail ? customerEmail : process.env.ADMIN_EMAIL,
      subject: emailSubject,
      html: emailHtml,
    });
  }
}

module.exports = new EmailService();
