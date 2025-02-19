const Order = require("../../models/Order");
const Product = require("../../models/Product");

const getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const startDateTime = startDate ? new Date(startDate) : new Date(0);
    const endDateTime = endDate ? new Date(endDate) : new Date();

    // Get orders within date range
    const orders = await Order.find({
      orderDate: {
        $gte: startDateTime,
        $lte: endDateTime
      },
      paymentStatus: "paid"
    });

    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Calculate sales by category
    const salesByCategory = {};
    orders.forEach(order => {
      order.cartItems.forEach(item => {
        if (!salesByCategory[item.category]) {
          salesByCategory[item.category] = {
            revenue: 0,
            quantity: 0
          };
        }
        salesByCategory[item.category].revenue += item.price * item.quantity;
        salesByCategory[item.category].quantity += item.quantity;
      });
    });

    // Get sales by month
    const salesByMonth = {};
    orders.forEach(order => {
      const monthYear = new Date(order.orderDate).toLocaleString('en-US', { month: 'long', year: 'numeric' });
      if (!salesByMonth[monthYear]) {
        salesByMonth[monthYear] = 0;
      }
      salesByMonth[monthYear] += order.totalAmount;
    });

    // Get payment method distribution
    const paymentMethods = {};
    orders.forEach(order => {
      if (!paymentMethods[order.paymentMethod]) {
        paymentMethods[order.paymentMethod] = 0;
      }
      paymentMethods[order.paymentMethod]++;
    });

    // Get best selling products
    const productSales = {};
    orders.forEach(order => {
      order.cartItems.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            title: item.title,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.price * item.quantity;
      });
    });

    const bestSellers = Object.entries(productSales)
      .map(([id, data]) => ({
        id,
        ...data
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Get order status distribution
    const orderStatus = {};
    orders.forEach(order => {
      if (!orderStatus[order.orderStatus]) {
        orderStatus[order.orderStatus] = 0;
      }
      orderStatus[order.orderStatus]++;
    });

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalOrders: orders.length,
        salesByCategory,
        salesByMonth,
        paymentMethods,
        bestSellers,
        orderStatus
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching analytics',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = {
  getAnalytics
};
