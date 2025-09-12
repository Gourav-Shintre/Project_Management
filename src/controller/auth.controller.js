import { verifyJWT } from "../middlewares/auth.middleware.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import {
  emailVerificationMailgenContent,
  forgotPasswordVerificationMailgenContent,
  sendEmail,
} from "../utils/mail.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { log } from "console";

//function to generate access and refresh token
const generateAccessAndRefreshToken = async (userId) => {
  try {
    //findById is used to find a document by its id
    const user = await User.findById(userId);
    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();

    user.refreshToken = refreshToken;
    user.accessToken = accessToken;

    await user.save({ validateBeforeSave: false }); // it means don't run the validation before saving the document
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating tokens",
      error
    );
  }
};

// function to register user
const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //findone is used to find one document from the database
  const existedUser = await User.findOne({
    $or: [{ email }, { username }], //or is used to check either of the condition is true
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists", []);
  }

  //create  method is used to create a new document in the database
  const user = await User.create({
    email,
    password,
    isEmailVerified: false,
    username,
  });

  const { unHashedToken, hasedToken, tokenExpiry } =
    user.generateTemporaryToken();
  //hashed token means it is encrypted version of unhashed token
  user.emailVerificationToken = hasedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user?.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user?.username,

      //   http://localhost:5000/api/v1/users/login example of req.protocol and req.get("host") protocol is http and host is localhost:5000
      `${req.protocol}://${req.get("host")}/api/v1/users/verify-email?token=${unHashedToken}`
    ),
  });

  //it means we are not sending password and refresh token in the response
  const createdUser = await User.findById(user?._id).select(
    "-password -refreshToken -accessToken -emailVerificationToken -emailVerificationExpiry -forgotPasswordToken -forgotPasswordExpiry"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while regestring user", []);
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        { user: createdUser },
        "user registered successfully , please verify your email"
      )
    );
});

//function for login
const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username || !email) {
    throw new ApiError(400, "Username or Email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(400, "user doesn't exists");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Password is incorrect");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user logged in successfully"
      )
    );
});

//function for logout
const logoutUser = asyncHandler(async (req, res) => {
  // req.user._id we will get this from the verifyJWT middleware check middle ware we are sending in the route
  const user = await User.findByIdAndUpdate(
    //it will find the user by id and update it
    req.user._id,
    {
      //this is used to set the value of a field in the document
      $set: {
        refreshToken: "",
      },
    },
    {
      //it give the latest object or document
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

//function to get current user details
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: req?.user },
        "Current user details fetched successfully"
      )
    );
});

//function for email verification
const verifyEmail = asyncHandler(async (req, res) => {
  const { verificationToken } = req?.params; //we can get data from params
  if (!verificationToken) {
    throw new ApiError(400, "Email Verification token is missing");
  }

  //crypto is a module in node js which is used to create hashes
  const hasedToken = crypto
    .createHash("sha256") //sha256 is a hashing algorithm
    .update(verificationToken) //update method is used to update the data for hashing
    .digest("hex"); //digest method is used to convert the data into hexadecimal format

  const user = await User.findOne({
    emailVerificationToken: hasedToken,
    emailVerificationExpiry: {
      $gt: Date.now(), //it means the token is not expired it will check the token expiry is greater than current time
    },
  });

  if (!user) {
    throw new ApiError(400, " Token is Invalid or Expired");
  }

  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  user.isEmailVerified = true;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isEmailVerified: true },
        "Email is verified successfully"
      )
    );
});

//function for resend email verification
const resendEmailVerificationEmail = asyncHandler(async (req, res) => {
  const user = await User.findById(req?.user?._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user?.isEmailVerified) {
    throw new ApiError(409, "Email is already verified");
  }

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });
  await sendEmail({
    email: user?.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user?.username,

      //   http://localhost:5000/api/v1/users/login example of req.protocol and req.get("host") protocol is http and host is localhost:5000
      `${req.protocol}://${req.get("host")}/api/v1/users/verify-email?token=${unHashedToken}`
    ),
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Email verification link is sent to your email address"
      )
    );
});

//to generate access token with refresh token
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req?.cookies?.refreshToken || req?.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(400, "Refresh token is required");
  }

  try {
    const decodedRefreshToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedRefreshToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token , user not found");
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, " Refresh Token is expired");
    }
    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user?._id);

    await user?.save({ validateBeforeSave: true });

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access Token Refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
});

//function for forgot password
const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { email } = req?.body;

  const user = await User?.findOne(
    { email },
    { forgotPasswordToken: 1, forgotPasswordExpiry: 1 }
  );
  console.log(user, "USER");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const { hashedToken, unHashedToken, tokenExpiry } =
    user.generateTemporaryToken();
  console.log(hashedToken, "hashedToken");
  console.log(unHashedToken, "unHashedToken");

  await user.save({ validateBeforeSave: true });

  await sendEmail({
    email,
    subject: "Password reset request",
    mailgenContent: forgotPasswordVerificationMailgenContent(
      user?.username,
      `${process.env.FORGOT_PASSWORD_URL}/?token=${unHashedToken}`
    ),
  });

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset link sent to your email"));
});

// function for reset passowrd
const resetpassword = asyncHandler(async (req, res) => {
  const { resetToken } = req?.params;
  const { newPassword } = req?.body;

  let hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User?.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(489, "Token is invalid or expired");
  }

  user.forgotPasswordExpiry = undefined;
  user.forgotPasswordToken = undefined;
  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Password reset successfully, please login with your new password"
      )
    );
});

//function for change the passord
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req?.body;

  //user is alredy authenticated we will get the user from the req.user which we set in the verifyJWT middleware
  const user = await User.findById(req?.user?._id);

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(400, "Old password is incorrect");
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password changed successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  verifyEmail,
  resendEmailVerificationEmail,
  refreshAccessToken,
  forgotPasswordRequest,
  resetpassword,
  changePassword,
};
