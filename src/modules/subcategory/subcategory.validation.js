import joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middleware.js";

// create
export const createSubCategorySchema = joi
  .object({
    name: joi.string().min(5).max(20).required(),
    categoryId: joi.string().custom(isValidObjectId).required(),
  })
  .required();

// update
export const updateSubCategorySchema = joi
  .object({
    name: joi.string().min(5).max(20),
    categoryId: joi.string().custom(isValidObjectId).required(),
    subcategoryId: joi.string().custom(isValidObjectId).required(),
  })
  .required();

// delete
export const deleteSubCategorySchema = joi
  .object({
    categoryId: joi.string().custom(isValidObjectId).required(),
    subcategoryId: joi.string().custom(isValidObjectId).required(),
  })
  .required();
