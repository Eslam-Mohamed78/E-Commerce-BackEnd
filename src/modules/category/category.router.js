import { Router } from "express";
import {isValid} from "./../../middleware/validation.middleware.js";
import isAuthenticated from "./../../middleware/authentication.middleware.js";
import isAuthorized from "./../../middleware/authorization.middleware.js";
import {
  createCategorySchema,
  deleteCategorySchema,
  updateCategorySchema,
} from "./category.validation.js";
import { fileUpload, filterObject } from "../../utils/multer.js";
import {
  allCategories,
  createCategory,
  deleteCategory,
  updateCategory,
} from "./category.controller.js";
import subcategoryRouter from "./../subcategory/subcategory.router.js"
import productRouter from "./../product/product.router.js"

const router = Router();

router.use("/:categoryId/subcategory", subcategoryRouter)
router.use("/:categoryId/product", productRouter)

// CRUD
// create
router.post(
  "/",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload(filterObject.image).single("category"),
  isValid(createCategorySchema),
  createCategory
);

// update
router.patch(
  "/:categoryId",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload(filterObject.image).single("category"),
  isValid(updateCategorySchema),
  updateCategory
);

// delete
router.delete(
  "/:categoryId",
  isAuthenticated,
  isAuthorized("admin"),
  isValid(deleteCategorySchema),
  deleteCategory
);

// read
router.get("/", allCategories)

export default router;
