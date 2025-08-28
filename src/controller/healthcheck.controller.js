import { ApiResponse } from "../utils/apiResponse.js";

const healtCheck = (req, res) => {
  try {
    res
      .status(200)
      .json(new ApiResponse(200, { messgae: "Server is running" }));
  } catch (error) {}
};

export { healtCheck };
