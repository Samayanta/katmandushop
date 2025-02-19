const { imageUploadUtil, deleteImageUtil } = require("../../helpers/cloudinary");
const Product = require("../../models/Product");

const handleImageUpload = async (req, res) => {
  try {
    console.log('File upload request received:', req.file);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const url = "data:" + req.file.mimetype + ";base64," + b64;
    
    console.log('Attempting to upload to Cloudinary...');
    const result = await imageUploadUtil(url);
    console.log('Cloudinary upload result:', result);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Error occurred during image upload",
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

//add a new product
const addProduct = async (req, res) => {
  try {
    const {
      image,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      averageReview,
      colors,
      sizes, // Add sizes to destructuring
    } = req.body;

    // Convert comma-separated strings to arrays and trim whitespace
    const colorArray = colors ? colors.split(',').map(color => color.trim()).filter(color => color !== '') : [];
    const sizeArray = sizes ? sizes.split(',').map(size => size.trim()).filter(size => size !== '') : [];

    console.log("Colors:", colorArray);
    console.log("Sizes:", sizeArray);

    const newlyCreatedProduct = new Product({
      image,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      averageReview,
      colors: colorArray,
      sizes: sizeArray, // Add sizes to product
    });

    await newlyCreatedProduct.save();
    res.status(201).json({
      success: true,
      data: newlyCreatedProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error occurred",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

//fetch all products
const fetchAllProducts = async (req, res) => {
  try {
    const listOfProducts = await Product.find({});
    res.status(200).json({
      success: true,
      data: listOfProducts,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

//edit a product
const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      image,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      averageReview,
      colors,
      sizes, // Add sizes to destructuring
    } = req.body;

    let findProduct = await Product.findById(id);
    if (!findProduct)
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });

    // Convert comma-separated strings to arrays and trim whitespace
    const colorArray = colors ? colors.split(',').map(color => color.trim()).filter(color => color !== '') : findProduct.colors;
    const sizeArray = sizes ? sizes.split(',').map(size => size.trim()).filter(size => size !== '') : findProduct.sizes;

    findProduct.title = title || findProduct.title;
    findProduct.description = description || findProduct.description;
    findProduct.category = category || findProduct.category;
    findProduct.brand = brand || findProduct.brand;
    findProduct.price = price === "" ? 0 : price || findProduct.price;
    findProduct.salePrice = salePrice === "" ? 0 : salePrice || findProduct.salePrice;
    findProduct.totalStock = totalStock || findProduct.totalStock;
    findProduct.image = image || findProduct.image;
    findProduct.averageReview = averageReview || findProduct.averageReview;
    findProduct.colors = colorArray;
    findProduct.sizes = sizeArray; // Add sizes to update

    console.log("Updated colors:", colorArray);
    console.log("Updated sizes:", sizeArray);

    await findProduct.save();
    res.status(200).json({
      success: true,
      data: findProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error occurred",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

//delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });

    res.status(200).json({
      success: true,
      message: "Product delete successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.body;
    const result = await deleteImageUtil(publicId);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error occurred while deleting image",
    });
  }
};

module.exports = {
  handleImageUpload,
  addProduct,
  fetchAllProducts,
  editProduct,
  deleteProduct,
  deleteImage,
};
