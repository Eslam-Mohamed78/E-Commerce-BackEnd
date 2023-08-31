// we can make them as methods in the models

import cartModel from "../../../DB/models/cart.model.js";
import productModel from "../../../DB/models/product.model.js";

// clear cart
export const clearCart = async (userId) => {
  await cartModel.findOneAndUpdate({ user: userId }, { products: [] });
};

// update stock
export const updateStock = async (products, placeOrder) => {
  // placeOrder >> true (place order) || false (cancel order)
  if (placeOrder) {
    for (const cartProduct of products) {
      await productModel.findOneAndUpdate(cartProduct.productId, {
        $inc: {
          availableItems: -cartProduct.quantity, // decrease
          soldItems: cartProduct.quantity, // increase
        },
      });
    }
  } else {
    for (const cartProduct of products) {
      await productModel.findOneAndUpdate(cartProduct.productId, {
        $inc: {
          availableItems: cartProduct.quantity, // increase
          soldItems: -cartProduct.quantity, // decrease
        },
      });
    }
  }
};
