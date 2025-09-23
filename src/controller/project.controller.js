import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Project } from "../models/project.model.js";
import { ApiError } from "../utils/apiError.js";

//function to create a project
const createProject = asyncHandler(async (req, res) => {
  const {
    project_title,
    project_description,
    project_members,
    created_by,
    tasks,
  } = req?.body;

  if (!project_title || !project_members?.length) {
    throw new ApiError(404, "Project title and members are required");
  }

  const user = await User.findById(created_by);
  if (!user) {
    throw new ApiError(401, "User not found");
  }

  const project = await Project.create({
    project_title,
    project_description,
    project_members,
    created_by,
    tasks,
  });

  res
    .status(200)
    .json(new ApiResponse(200, project, "Project created successfully"));
});

//function for get all list
const getAllProjectList = asyncHandler(async (req, res) => {
  const projects = await Project.find(); // find will give all the projects

  if (!projects) {
    throw new ApiError(404, "No project found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, projects, "Project list fetched successfully"));
});

//function for get single project details
const getprojectById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = await Project.findById(id);

  if (!project) {
    throw new ApiError(409, "Project not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, project, "Project details fetched successfully")
    );
});

//function for update project details
const updateProjectById = asyncHandler(async (req, res) => {
  const { id } = req?.params;
  const { project_title, project_description, project_members, tasks } =
    req?.body;

  const updatedFields = {
    ...(project_title && { project_title }),
    ...(project_description && { project_description }),
    ...(project_members && { project_members }),
    ...(tasks && { tasks }),
  };

  const project = await Project.findByIdAndUpdate(
    id,
    {
      $set: updatedFields,
    },
    {
      new: true,
    }
  );
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, project, "project updated successfully"));
});

//function for delete project by id
const deleteProjectById = asyncHandler(async (req, res) => {
  const { id } = req?.params;

  const project = await Project.findByIdAndDelete(id);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, project, "Project deleted successfully"));
});

export {
  createProject,
  getAllProjectList,
  getprojectById,
  updateProjectById,
  deleteProjectById,
};
