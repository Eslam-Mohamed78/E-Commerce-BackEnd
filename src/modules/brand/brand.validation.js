import joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";

// Create Brand
export const createBrandSchema = joi
  .object({
    name: joi.string().min(4).max(15).required(),
    categoryId: joi.string().custom(isValidObjectId).required(),
  })
  .required();

// Update Brand
export const updateBrandSchema = joi
  .object({
    name: joi.string().min(4).max(15),
    brandId: joi.string().custom(isValidObjectId).required(),
  })
  .required();

// Delete Brand
export const deleteBrandSchema = joi
  .object({
    brandId: joi.string().custom(isValidObjectId).required(),
  })
  .required();
