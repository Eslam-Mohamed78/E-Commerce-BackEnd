import { Router } from "express";
import  {isValid}  from "../../middleware/validation.middleware.js";
import {
  activateSchema,
  forgetCodeSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "./auth.validation.js";
import {
  activateAccount,
  login,
  register,
  resetPassword,
  sendForgetCode,
} from "./auth.controller.js";

const router = Router();

// Register
router.post("/register", isValid(registerSchema), register);

// Confirm Email (Activate Account)
router.get(
  "/confirmEmail/:activationCode",
  isValid(activateSchema),
  activateAccount
);

// Login
router.post("/login", isValid(loginSchema), login);

// Send forget-password code
router.patch("/forgetCode", isValid(forgetCodeSchema), sendForgetCode);

// Reset Password
router.patch("/resetPassword", isValid(resetPasswordSchema), resetPassword)
export default router;
