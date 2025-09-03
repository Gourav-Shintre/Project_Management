import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken";
const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header?.("Authorization")?.replace("Bearear", "");

  if (!token) {
    throw new ApiError(401, "you are not login , please login to get access");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );

    if (!user) {
      throw new ApiError(401, "Invalid token , user not found");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "Invalid token or Token expired");
  }
});

export { verifyJWT };
