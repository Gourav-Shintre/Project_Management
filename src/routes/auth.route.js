import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
} from "../controller/auth.controller.js";
import { validate } from "../middlewares/validator.middleware.js";
import { loginValidation, userRegisterValidator } from "../validators/index.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(loginValidation(), validate, loginUser);
router.route("/logout").post(verifyJWT, logoutUser);

export default router;
