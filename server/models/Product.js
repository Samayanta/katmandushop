const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    image: String,
    title: String,
    description: String,
    category: String,
    brand: String,
    price: Number,
    salePrice: Number,
    totalStock: Number,
    averageReview: Number,
    colors: [String], // Array of color options
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
