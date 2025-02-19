const express = require("express");
const emailService = require("../../helpers/email-service");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ status: "ok" });
});

router.post("/test-email", async (req, res) => {
  try {
    const testOrder = {
      _id: "TEST-" + Date.now(),
      addressInfo: {
        name: "Test Customer",
        phone: "9876543210",
        address: "Test Address",
        city: "Kathmandu",
        pincode: "44600",
        notes: "This is a test order"
      },
      cartItems: [
        {
          title: "Test Product 1",
          image: "https://via.placeholder.com/150",
          selectedColor: "Red",
          selectedSize: "XL",
          quantity: 2,
          price: 1500
        },
        {
          title: "Test Product 2",
          image: "https://via.placeholder.com/150",
          selectedColor: "Blue",
          selectedSize: "M",
          quantity: 1,
          price: 2000
        }
      ],
      totalAmount: 5000,
      paymentMethod: "khalti",
      paymentStatus: "pending",
      orderStatus: "processing"
    };

    await emailService.sendOrderNotification(testOrder, "testcustomer@example.com");
    
    res.json({ 
      success: true, 
      message: "Test email sent successfully! Check your admin email inbox."
    });
  } catch (error) {
    console.error("Email test failed:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to send test email",
      error: error.message 
    });
  }
});

module.exports = router;
