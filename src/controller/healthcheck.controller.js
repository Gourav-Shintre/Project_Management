import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// const healtCheck = (req, res) => {
//   try {
//     res
//       .status(200)
//       .json(new ApiResponse(200, { messgae: "Server is running" }));
//   } catch (error) {}
// };


//we dont need to write try catch block evry time for that we use HOF
const healtCheck = asyncHandler(async (req, res) => {
  res
  .status(200)
  .json(new ApiResponse (200, {message : "server is running"}))
});

export { healtCheck };
