import joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";

// Create category
export const createCategorySchema = joi
  .object({
    name: joi.string().min(4).max(15).required(),
    // objectId validation
    createdBy: joi.string().custom(isValidObjectId),
  })
  .required();

// Update category
export const updateCategorySchema = joi
  .object({
    name: joi.string().min(4).max(15),
    categoryId: joi.string().custom(isValidObjectId).required(),
  })
  .required();

// Delete category
export const deleteCategorySchema = joi
  .object({
    categoryId: joi.string().custom(isValidObjectId).required(),
  })
  .required();
