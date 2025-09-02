import { validationResult } from "express-validator";
import { ApiError } from "../utils/apiError.js";
export const validate = (req, res, next) => {
  const erros = validationResult(req);

  if (erros.isEmpty()) {
    return next();
  }

  const extractedErrors = [];
  //here we are pushing errors into array with pat and msg
  erros.array().map((err) => extractedErrors.push({ [err.path]: err.msg }));

  throw new ApiError(422, "Recieved data is not valid", extractedErrors);
};
