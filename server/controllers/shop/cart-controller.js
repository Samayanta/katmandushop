const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity, selectedColor, selectedSize } = req.body;

    // Debug logging
    console.log("Add to cart request:", {
      userId,
      productId,
      quantity,
      selectedColor,
      selectedSize,
      body: req.body
    });

    if (!userId || !productId || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
        missing: {
          userId: !userId,
          productId: !productId,
          quantity: quantity <= 0
        }
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check stock availability
    if (quantity > product.totalStock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.totalStock} items available in stock`,
      });
    }

    // Check if size selection is required
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      return res.status(400).json({
        success: false,
        message: "Size selection required for this product",
      });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Default values if product doesn't have options
    const color = product.colors?.length > 0 ? selectedColor : "default";
    const size = product.sizes?.length > 0 ? selectedSize : "default";

    const sameItemIndex = cart.items.findIndex(
      (item) => 
        item.productId.toString() === productId && 
        item.selectedColor === color &&
        item.selectedSize === size
    );
    
    if (sameItemIndex !== -1) {
      // Check if total quantity exceeds stock
      const totalQuantity = cart.items[sameItemIndex].quantity + quantity;
      if (totalQuantity > product.totalStock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add ${quantity} more items. Only ${product.totalStock - cart.items[sameItemIndex].quantity} more available.`,
        });
      }
      cart.items[sameItemIndex].quantity += quantity;
    } else {
      cart.items.push({ 
        productId, 
        quantity, 
        selectedColor: color,
        selectedSize: size
      });
    }

    await cart.save();
    
    await cart.populate({
      path: "items.productId",
      select: "image title price salePrice colors sizes",
    });

    const populateCartItems = cart.items.map((item) => ({
      productId: item.productId._id,
      image: item.productId.image,
      title: item.productId.title,
      price: item.productId.price,
      salePrice: item.productId.salePrice,
      quantity: item.quantity,
      selectedColor: item.selectedColor,
      selectedSize: item.selectedSize,
      availableColors: item.productId.colors || [],
      availableSizes: item.productId.sizes || [],
    }));

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log("Cart addition error:", error);
    res.status(500).json({
      success: false,
      message: "Error",
      error: error.message
    });
  }
};

const fetchCartItems = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User id is manadatory!",
      });
    }

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "image title price salePrice colors sizes totalStock",
    });

    if (!cart) {
      // Create a new empty cart if one doesn't exist
      cart = new Cart({ userId, items: [] });
      await cart.save();
      return res.status(200).json({
        success: true,
        data: {
          ...cart._doc,
          items: [],
        },
      });
    }

    const validItems = cart.items.filter(
      (productItem) => productItem.productId
    );

    if (validItems.length < cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    // Check and adjust quantities if they exceed current stock
    let quantityAdjusted = false;
    const populateCartItems = validItems.map((item) => {
      let quantity = item.quantity;
      if (quantity > item.productId.totalStock) {
        quantity = item.productId.totalStock;
        quantityAdjusted = true;
      }
      
      return {
        productId: item.productId._id,
        image: item.productId.image,
        title: item.productId.title,
        price: item.productId.price,
        salePrice: item.productId.salePrice,
        quantity: quantity,
        selectedColor: item.selectedColor,
        availableColors: item.productId.colors || [],
        selectedSize: item.selectedSize,
        availableSizes: item.productId.sizes || [],
      };
    });

    if (quantityAdjusted) {
      // Update cart with adjusted quantities
      cart.items = validItems.map((item) => ({
        ...item,
        quantity: Math.min(item.quantity, item.productId.totalStock)
      }));
      await cart.save();
    }

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const updateCartItemQty = async (req, res) => {
  try {
    const { userId, productId, quantity, selectedColor } = req.body;

    if (!userId || !productId || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });
    }

    // Check stock availability
    if (quantity > product.totalStock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.totalStock} items available in stock`,
      });
    }

    // Use default color if product doesn't have colors
    const color = product.colors?.length > 0 ? selectedColor : "default";

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId && item.selectedColor === color
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Cart item not present!",
      });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "image title price salePrice colors",
    });

    const populateCartItems = cart.items.map((item) => ({
      productId: item.productId ? item.productId._id : null,
      image: item.productId ? item.productId.image : null,
      title: item.productId ? item.productId.title : "Product not found",
      price: item.productId ? item.productId.price : null,
      salePrice: item.productId ? item.productId.salePrice : null,
      quantity: item.quantity,
      selectedColor: item.selectedColor,
      availableColors: item.productId ? item.productId.colors || [] : [],
    }));

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "image title price salePrice colors",
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    cart.items = cart.items.filter(
      (item) => item.productId._id.toString() !== productId
    );

    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "image title price salePrice colors",
    });

    const populateCartItems = cart.items.map((item) => ({
      productId: item.productId ? item.productId._id : null,
      image: item.productId ? item.productId.image : null,
      title: item.productId ? item.productId.title : "Product not found",
      price: item.productId ? item.productId.price : null,
      salePrice: item.productId ? item.productId.salePrice : null,
      quantity: item.quantity,
      selectedColor: item.selectedColor,
      availableColors: item.productId ? item.productId.colors || [] : [],
    }));

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User id is mandatory!",
      });
    }

    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: cart
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error clearing cart",
    });
  }
};

module.exports = {
  addToCart,
  updateCartItemQty,
  deleteCartItem,
  fetchCartItems,
  clearCart,
};
