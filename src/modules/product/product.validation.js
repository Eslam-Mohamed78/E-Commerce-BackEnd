import joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";

// create product
export const createProductSchema = joi
  .object({
    name: joi.string().required().min(2).max(20),
    description: joi.string(),
    availableItems: joi.number().min(1).required(),
    price: joi.number().min(1).required(),
    discount: joi.number().min(1).max(100),
    categoryId: joi.string().custom(isValidObjectId),
    subcategoryId: joi.string().custom(isValidObjectId),
    brandId: joi.string().custom(isValidObjectId),
  })
  .required();

// delete product + get single product
export const productIdSchema = joi
  .object({
    productId: joi.string().custom(isValidObjectId).required(),
  })
  .required();
