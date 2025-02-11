const Order = require("../../models/Order");
const User = require("../../models/User");
const mongoose = require("mongoose");

const getAllOrdersOfAllUsers = async (req, res) => {
  try {
    const orders = await Order.find({}).lean();
    
    // Get unique userIds
    const userIds = [...new Set(orders.map(order => order.userId))];
    
    // Convert string IDs to ObjectIds
    const userObjectIds = userIds.map(id => new mongoose.Types.ObjectId(id));
    
    // Fetch all users in one query with userName field
    const users = await User.find({ _id: { $in: userObjectIds } }, 'userName email').lean();
    
    // Create a map of userId to user info for quick lookup
    const userMap = users.reduce((acc, user) => {
      acc[user._id.toString()] = user;
      return acc;
    }, {});
    
    // Attach user info to orders, map userName to name for frontend consistency
    const ordersWithUser = orders.map(order => ({
      ...order,
      user: userMap[order.userId] 
        ? {
            name: userMap[order.userId].userName,
            email: userMap[order.userId].email
          }
        : { name: 'Unknown', email: 'Unknown' }
    }));

    console.log('User Map:', userMap);
    console.log('Orders with users:', ordersWithUser);

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    res.status(200).json({
      success: true,
      data: ordersWithUser,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getOrderDetailsForAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).lean();
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    // Get user information
    const user = await User.findById(new mongoose.Types.ObjectId(order.userId), 'userName email').lean();
    
    const orderWithUser = {
      ...order,
      user: user 
        ? { 
            name: user.userName, 
            email: user.email 
          }
        : { name: 'Unknown', email: 'Unknown' }
    };

    res.status(200).json({
      success: true,
      data: orderWithUser,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    await Order.findByIdAndUpdate(id, { orderStatus });

    res.status(200).json({
      success: true,
      message: "Order status is updated successfully!",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
};
