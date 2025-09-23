import { Router } from "express";
import {
  createProject,
  deleteProjectById,
  getAllProjectList,
  getprojectById,
  updateProjectById,
} from "../controller/project.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create").post(verifyJWT, createProject);

router.route("/project-list").get(verifyJWT, getAllProjectList);

router.route("/:id").get(verifyJWT, getprojectById);

router.route("/update/:id").put(verifyJWT, updateProjectById);

router.route("/delete/:id").delete(verifyJWT, deleteProjectById);

export default router;
