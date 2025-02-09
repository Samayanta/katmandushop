const khaltiService = require("../../helpers/khalti");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus,
      totalAmount,
      orderDate,
      orderUpdateDate,
      cartId,
    } = req.body;

    console.log('Creating order with data:', { 
      userId, cartItems, totalAmount, paymentMethod 
    });

    const newOrder = new Order({
      userId,
      cartId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus,
      totalAmount,
      orderDate,
      orderUpdateDate,
    });

    await newOrder.save();
    console.log('Order saved with ID:', newOrder._id);

    // Initiate Khalti payment
    try {
      const paymentData = await khaltiService.initiatePayment(
        totalAmount,
        newOrder._id.toString(),
        cartItems,
        req.user // Pass user info from auth middleware
      );

      console.log('Generated Khalti payment URL:', paymentData.payment_url);

      res.status(201).json({
        success: true,
        orderId: newOrder._id,
        payment_url: paymentData.payment_url,
        pidx: paymentData.pidx
      });
    } catch (error) {
      // If Khalti config fails, delete the order and notify client
      await Order.findByIdAndDelete(newOrder._id);
      throw new Error(`Failed to initialize payment: ${error.message}`);
    }
  } catch (e) {
    console.error('Order creation error:', e);
    res.status(500).json({
      success: false,
      message: e.message || "Error occurred while creating order",
      error: process.env.NODE_ENV === 'development' ? e.stack : undefined
    });
  }
};

const capturePayment = async (req, res) => {
  let order = null;
  try {
    const { pidx, orderId } = req.body;
    console.log('Verifying payment:', { pidx, orderId });

    // Validate input
    if (!pidx || !orderId) {
      throw new Error('Missing required payment parameters');
    }

    order = await Order.findById(orderId);
    if (!order) {
      console.log('Order not found:', orderId);
      throw new Error('Order not found');
    }

    try {
      // Verify payment with Khalti
      console.log('Looking up payment status with Khalti...', { pidx });
      const verificationData = await khaltiService.verifyPayment(pidx);

      console.log('Payment verification successful:', verificationData);

      // Update order with payment details
      order.paymentStatus = "paid";
      order.orderStatus = "confirmed";
      order.paymentId = verificationData.idx || verificationData.pidx || token;
      order.paymentDetails = verificationData;

      // Update product stock
      console.log('Updating product stock...');
      for (let item of order.cartItems) {
        let product = await Product.findById(item.productId);
        if (!product) {
          throw new Error(`Product not found: ${item.title}`);
        }

        if (product.totalStock < item.quantity) {
          throw new Error(`Insufficient stock for product: ${item.title}`);
        }

        product.totalStock -= item.quantity;
        await product.save();
        console.log(`Updated stock for product ${item.title}: ${product.totalStock}`);
      }

      // Remove cart after successful payment
      if (order.cartId) {
        console.log('Removing cart:', order.cartId);
        await Cart.findByIdAndDelete(order.cartId);
      }

      await order.save();
      console.log('Order updated successfully');

      res.status(200).json({
        success: true,
        message: "Payment verified and order confirmed",
        data: order,
      });
    } catch (error) {
      console.error('Payment verification failed:', error);
      
      if (order) {
        // Revert order status
        order.paymentStatus = "failed";
        order.orderStatus = "cancelled";
        await order.save();
      }

      throw error;
    }
  } catch (e) {
    console.error('Payment capture error:', e);
    res.status(500).json({
      success: false,
      message: e.message || "Error occurred while capturing payment",
      error: process.env.NODE_ENV === 'development' ? e.stack : undefined
    });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching orders for user:', userId);

    const orders = await Order.find({ userId });

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.error('Error fetching user orders:', e);
    res.status(500).json({
      success: false,
      message: e.message || "Error occurred while fetching orders",
      error: process.env.NODE_ENV === 'development' ? e.stack : undefined
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching order details:', id);

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.error('Error fetching order details:', e);
    res.status(500).json({
      success: false,
      message: e.message || "Error occurred while fetching order details",
      error: process.env.NODE_ENV === 'development' ? e.stack : undefined
    });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
};
