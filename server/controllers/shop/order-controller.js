const khaltiService = require("../../helpers/khalti");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const User = require("../../models/User");
const mongoose = require("mongoose");
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

    // Convert userId to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const newOrder = new Order({
      userId: userObjectId,
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


    // Initiate payment
    try {
      // Get user details for order
      const user = await User.findById(userId, 'userName email').lean();
      if (!user) {
        throw new Error('User not found');
      }

      // Create user info object
      const userInfo = {
        id: userId,
        name: user.userName,
        email: user.email,
        phone: addressInfo.phone || ''
      };

      if (paymentMethod !== 'khalti') {
        throw new Error('Only Khalti payment method is supported');
      }

      const paymentData = await khaltiService.initiatePayment(
        totalAmount,
        newOrder._id.toString(),
        cartItems,
        userInfo
      );
      console.log('Generated Khalti payment URL:', paymentData.payment_url);
      
      const responseData = {
        success: true,
        orderId: newOrder._id,
        provider: paymentMethod,
        payment_url: paymentData.payment_url,
        pidx: paymentData.pidx
      };

      res.status(201).json(responseData);
    } catch (error) {
      // If payment initiation fails, delete the order and notify client
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

    if (!pidx || !orderId) {
      throw new Error('Missing required payment parameters');
    }

    order = await Order.findById(orderId);
    if (!order) {
      console.log('Order not found:', orderId);
      throw new Error('Order not found');
    }

    try {
      console.log('Looking up payment status with Khalti...', { pidx });
      const verificationData = await khaltiService.verifyPayment(pidx);
      console.log('Khalti payment verification successful:', verificationData);

      order.paymentStatus = verificationData.status === "Completed" ? "paid" : "pending";
      order.orderStatus = verificationData.status === "Completed" ? "confirmed" : "pending";
      order.paymentId = verificationData.pidx;
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

      // Remove cart after successful payment by userId
      console.log('Removing cart for user:', order.userId);
      await Cart.deleteOne({ userId: order.userId });

      await order.save();
      console.log('Order updated successfully');

      // Get user information for email
      const user = await User.findById(order.userId, 'userName email').lean();
      if (!user) {
        console.error('User not found for order:', order._id);
        throw new Error('User not found');
      }

          // Send notifications
          if (verificationData.status === "Completed") {
            try {
              const emailService = require("../../helpers/email-service");

              // Try to send email notifications, but don't block if they fail
              try {
                // Send email to admin
                await emailService.sendOrderNotification(
                  order,
                  user.email,
                  user.userName,
                  false // isClientEmail = false
                );
                console.log('Admin notification email sent');

                // Send email to customer
                await emailService.sendOrderNotification(
                  order,
                  user.email,
                  user.userName,
                  true // isClientEmail = true
                );
                console.log('Client notification email sent');
              } catch (emailError) {
                console.warn('Email notifications skipped:', emailError.message);
              }
            } catch (moduleError) {
              console.warn('Email module not available:', moduleError.message);
            }
          }

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

      // Add payment status to the error for better frontend handling
      const errorWithStatus = new Error(error.message);
      errorWithStatus.paymentStatus = error.message.includes('Payment status is') ? 'pending' : 'failed';
      throw errorWithStatus;
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

    const orders = await Order.find({ userId }).sort({ orderDate: -1 });

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
