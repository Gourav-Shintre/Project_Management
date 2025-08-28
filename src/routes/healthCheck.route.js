import { Router } from "express";
import { healtCheck } from "../controller/healthcheck.controller.js";
const router = Router();
 
router.route("/").get(healtCheck)
export default router;
