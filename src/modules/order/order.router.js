import { Router } from "express";
import { isValid } from "./../../middleware/validation.middleware.js";
import isAuthenticated from "./../../middleware/authentication.middleware.js";
import { cancelOrderSchema, createOrderSchema } from "./order.validation.js";
import { createOrder, cancelOrder } from "./order.controller.js";
import express from "express";
const router = Router();

// create
router.post("/", isAuthenticated, isValid(createOrderSchema), createOrder);

// cancel
router.patch(
  "/:orderId",
  isAuthenticated,
  isValid(cancelOrderSchema),
  cancelOrder
);

// Webhook
// stripe will call this endpoint after the money is taken

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  orderWebhook
);

export default router;
