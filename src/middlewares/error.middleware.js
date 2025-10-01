import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res
      .status(err.statusCode)
      .json(new ApiResponse(err.statusCode, err.data, err.message));
  }
  return res
    .status(500)
    .json(new ApiResponse(500, null, "Internal Server Error"));
};

export { errorHandler };
