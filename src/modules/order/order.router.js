import { Router } from "express";
import { isValid } from "./../../middleware/validation.middleware.js";
import isAuthenticated from "./../../middleware/authentication.middleware.js";
import isAuthorized from "./../../middleware/authorization.middleware.js";
import { cancelOrderSchema, createOrderSchema } from "./order.validation.js";
import { createOrder, cancelOrder } from "./order.controller.js";
const router = Router();

// create
router.post("/", isAuthenticated, isValid(createOrderSchema), createOrder);

// cancel
router.patch("/:orderId", isAuthenticated, isValid(cancelOrderSchema), cancelOrder);

export default router;
