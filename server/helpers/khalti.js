const axios = require("axios");

class KhaltiService {
  constructor() {
    this.secretKey = process.env.KHALTI_SECRET_KEY;
    this.clientUrl = process.env.CLIENT_URL;

    // Validate required environment variables
    if (!this.secretKey) {
      throw new Error('KHALTI_SECRET_KEY environment variable is required');
    }
    if (!this.clientUrl) {
      throw new Error('CLIENT_URL environment variable is required');
    }

    this.axios = axios.create({
      baseURL: "https://khalti.com/api/v2/",
      headers: {
        'Authorization': `Key ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async verifyPayment(pidx) {
    try {
      if (!pidx) {
        throw new Error('Payment ID (pidx) is required');
      }

      console.log('Verifying Khalti payment:', pidx);
      const response = await this.axios.post('epayment/lookup/', { pidx });

      console.log('Khalti verification response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Khalti verification error:', error.response?.data || error);
      throw new Error(
        error.response?.data?.detail || 
        error.response?.data?.message || 
        error.message || 
        'Khalti verification failed'
      );
    }
  }

  async initiatePayment(amount, orderId, orderDetails, user) {
    try {
      if (!amount || amount <= 0) {
        throw new Error('Valid amount is required');
      }
      if (!orderId) {
        throw new Error('Order ID is required');
      }
      if (!user) {
        throw new Error('User information is required');
      }

      const amountInPaisa = Math.round(amount * 100);
      console.log('Amount in paisa:', amountInPaisa);

      const payload = {
        return_url: `${this.clientUrl}/shop/payment-success`,
        website_url: this.clientUrl,
        amount: amountInPaisa.toString(),
        purchase_order_id: orderId,
        purchase_order_name: `Order #${orderId}`,
        customer_info: {
          name: user.name || 'Customer',
          email: user.email,
          phone: user.phone || ''
        }
      };

      console.log('Initiating Khalti payment:', {
        ...payload,
        customer_info: {
          ...payload.customer_info,
          email: payload.customer_info.email.substring(0, 3) + '...'
        }
      });

      const response = await this.axios.post('epayment/initiate/', payload);
      console.log('Khalti initiation response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error initiating Khalti payment:', error);
      throw new Error(
        error.response?.data?.detail || 
        error.response?.data?.message || 
        error.message || 
        'Failed to initiate Khalti payment'
      );
    }
  }
}

// Create and export a single instance
const khaltiService = new KhaltiService();
console.log('Khalti service initialized');
module.exports = khaltiService;
