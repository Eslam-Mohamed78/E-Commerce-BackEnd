import joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";

// add to cart -- update cart
export const cartSchema = joi
  .object({
    productId: joi.string().custom(isValidObjectId).required(),
    quantity: joi.number().integer().min(1).required(),
  })
  .required();

// removeProductFromCart
export const removeProductFromCartSchema = joi
  .object({
    productId: joi.string().custom(isValidObjectId).required(),
  })
  .required();
