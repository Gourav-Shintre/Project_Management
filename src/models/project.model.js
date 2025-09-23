import mongoose, { Schema } from "mongoose";

const projectSchema = new Schema(
  {
    project_title: {
      type: String,
      required: true,
      index: true,
    },
    project_description: {
      type: String,
    },
    project_members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    created_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tasks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Project = mongoose.model("Project", projectSchema);
