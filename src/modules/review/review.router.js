import { Router } from "express";
import isAuthenticated from "../../middleware/authentication.middleware.js";
import { addReview } from "./review.controller.js";
const router = Router();

// CRUD
// create
router.post("/", isAuthenticated, addReview);

export default router;
