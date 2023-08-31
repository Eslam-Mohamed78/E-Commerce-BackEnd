import asyncHandler from "../../utils/asyncHandler.js";
import productModel from "../../../DB/models/product.model.js";
import cartModel from "../../../DB/models/cart.model.js";

export const addToCart = asyncHandler(async (req, res, next) => {
  // data
  const { productId, quantity } = req.body;
  const userId = req.user._id;
  console.log({ productId, quantity, userId });

  // check product existence
  const product = await productModel.findById(productId);
  if (!product) return next(new Error("Product not found!", { cause: 404 }));

  // check stock (if to much quantity)
  if (!product.inStock(quantity))
    return next(
      new Error(
        `Sorry, only ${product.availableItems} items left in the stock!`
      )
    );

  // check product existence in cart
  let cart = await cartModel.findOneAndUpdate(
    {
      user: userId,
      "products.productId": productId,
    },
    // $ >> to update the quantity that matches the condition ^^
    { $set: { "products.$.quantity": quantity } },
    { new: true }
  );

  if (cart) {
    // send response
    return res.json({
      success: true,
      message: "Product quantity updated successfully!",
      results: cart,
    });
  }

  // add new products using push operator
  cart = await cartModel.findOneAndUpdate(
    { user: userId },
    { $push: { products: { productId, quantity } } },
    { new: true } // to return document after update
  );

  // send response
  return res.json({
    success: true,
    message: "Products added successfully!",
    results: cart,
  });
});

export const userCart = asyncHandler(async (req, res, next) => {
  // data
  const userId = req.user._id;

  // check cart existence
  const cart = await cartModel.findOne({ user: userId }).populate(
    {
      path: "products.productId",
      select: "name defaultImage.url price finalPrice",
    }
    // finalPrice depend on price so to return it price should be returned
  );
  if (!cart) return next(new Error("Cart not found!", { cause: 404 }));

  // send response
  return res.json({ success: true, results: cart });
});

export const updateCart = asyncHandler(async (req, res, next) => {
  // data
  const { productId, quantity } = req.body;
  const userId = req.user._id;

  // check product existence
  const product = await productModel.findById(productId);
  if (!product) return next(new Error("Product not found!", { cause: 404 }));

  // check stock (if to much quantity)
  if (!product.inStock(quantity))
    return next(
      new Error(
        `Sorry, only ${product.availableItems} items left in the stock!`
      )
    );

  // update product
  const cart = await cartModel.findOneAndUpdate(
    // condition
    { user: userId, "products.productId": productId },
    // $ >> to update the quantity that matches the condition ^^
    { $set: { "products.$.quantity": quantity } },
    { new: true }
  );

  // send response
  return res.json({
    success: true,
    message: "Cart updated successfully",
    results: cart,
  });
});

export const removeProductFromCart = asyncHandler(async (req, res, next) => {
  // data
  const { productId } = req.params;
  const userId = req.user._id;

  // check product existence then remove
  const cart = await cartModel.findOneAndUpdate(
    { user: userId, "products.productId": productId },
    { $pull: { products: { productId: productId } } }, // pull deletes
    { new: true }
  );

  if (!cart) return next(new Error("Product not found!", { cause: 404 }));

  // send response
  return res.json({
    success: true,
    message: "Product removed successfully",
    results: cart,
  });
});

export const clearCart = asyncHandler(async (req, res, next) => {
  // data
  const userId = req.user._id;

  // clear cart
  const cart = await cartModel.findOneAndUpdate(
    { user: userId },
    { products: [] },
    { new: true }
  );

  // send response
  return res.json({
    success: true,
    message: "Cart cleared successfully",
    results: cart,
  });
});
