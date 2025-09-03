import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { emailVerificationMailgenContent, sendEmail } from "../utils/mail.js";
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
  const user = await User.findByIdAndUpdate( req.user._id);

});

export { registerUser, loginUser, logoutUser };
