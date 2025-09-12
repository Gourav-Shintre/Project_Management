import { Router } from "express";
import {
  changePassword,
  forgotPasswordRequest,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendEmailVerificationEmail,
  resetpassword,
  verifyEmail,
} from "../controller/auth.controller.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  loginValidation,
  userChangePasswordValidator,
  userForgotPasswordValidator,
  userRegisterValidator,
  userResetPasswordValidator,
} from "../validators/index.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

//unsecured routes
router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(loginValidation(), validate, loginUser);
//for email-verification
router.route("/verify-email/:verificationToken").get(verifyEmail);
//refresh token
router.route("/refresh-token").post(refreshAccessToken);
//refresh token
router
  .route("/forgot-password")
  .post(userForgotPasswordValidator(), validate, forgotPasswordRequest);

router
  .route("/reset-password/:resetToken")
  .post(userResetPasswordValidator(), validate, resetpassword);

//protected routes

router.route("/logout").post(verifyJWT, logoutUser);
//get current user
router.route("/current-user").get(verifyJWT, getCurrentUser);
router
  .route("/change-password")
  .post(verifyJWT,userChangePasswordValidator(), validate, changePassword);
router
  .route("/resend-email-verification")
  .post(verifyJWT, resendEmailVerificationEmail);

export default router;
