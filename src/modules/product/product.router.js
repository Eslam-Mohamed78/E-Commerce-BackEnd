import { Router } from "express";
import isAuthenticated from "../../middleware/authentication.middleware.js";
import isAuthorized from "../../middleware/authorization.middleware.js";
import { isValid } from "../../middleware/validation.middleware.js";
import { fileUpload, filterObject } from "../../utils/multer.js";
import { createProductSchema, productIdSchema } from "./product.validation.js";
import {
  addProduct,
  allProducts,
  deleteProduct,
  singleProduct,
} from "./product.controller.js";
 
// mergeParams to use categoryId when get products of category
const router = Router({ mergeParams: true });

// CRUD

// create
router.post(
  "/",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload(filterObject.image).fields([
    { name: "defaultImage", maxCount: 1 },
    { name: "subImages", maxCount: 3 },
  ]),
  isValid(createProductSchema),
  addProduct
);

// delete
router.delete(
  "/:productId",
  isAuthenticated,
  isAuthorized("admin"),
  isValid(productIdSchema),
  deleteProduct
);

// search products & get & category products
router.get("/", allProducts);

// single product
router.get("/single/:productId", isValid(productIdSchema), singleProduct);

// read all products of certain category
export default router;
