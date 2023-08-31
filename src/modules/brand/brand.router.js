import { Router } from "express";
import { isValid } from "./../../middleware/validation.middleware.js";
import isAuthenticated from "./../../middleware/authentication.middleware.js";
import isAuthorized from "./../../middleware/authorization.middleware.js";
import {
  createBrandSchema,
  deleteBrandSchema,
  updateBrandSchema,
} from "./brand.validation.js";
import { fileUpload, filterObject } from "../../utils/multer.js";
import {
  allBrands,
  createBrand,
  deleteBrand,
  updateBrand,
} from "./brand.controller.js";

const router = Router();

// CRUD
// create
router.post(
  "/",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload(filterObject.image).single("brand"),
  isValid(createBrandSchema),
  createBrand
);

// update
router.patch(
  "/:brandId",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload(filterObject.image).single("brand"),
  isValid(updateBrandSchema),
  updateBrand
);

// delete
router.delete(
  "/:brandId",
  isAuthenticated,
  isAuthorized("admin"),
  isValid(deleteBrandSchema),
  deleteBrand
);

// read
router.get("/", allBrands);

export default router;
