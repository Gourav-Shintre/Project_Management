import { ApiError } from "../utils/apiError.js";

// We don’t need asyncHandler here because there’s no async/await
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      throw new ApiError(
        403,
        "You don't have permission to perform this action"
      );
    }
    next();
  };
};

export { authorizeRole };
