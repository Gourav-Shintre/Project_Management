import { Router } from "express";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  verifyEmail,
} from "../controller/auth.controller.js";
import { validate } from "../middlewares/validator.middleware.js";
import { loginValidation, userRegisterValidator } from "../validators/index.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(loginValidation(), validate, loginUser);

//protected route
router.route("/logout").post(verifyJWT, logoutUser);

//get current user
router.route("/current-user").get(verifyJWT, getCurrentUser);

//for email-verification
router.route("verify-email/:verificationToken").get(verifyEmail);

export default router;
