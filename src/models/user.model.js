import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { UserRolesEnum, AvailableUserRole } from "../utils/constants.js";
const userSchema = new Schema(
  {
    avatar: {
      type: {
        url: String,
        localPath: String,
      },
      default: {
        url: `https://placehold.co/200`,
        localPath: "",
      },
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true, //it removes space
      index: true, //for searching
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordExpiry: {
      type: Date,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpiry: {
      type: String,
    },
    role: {
      type: String,
      enum: AvailableUserRole,
      default: UserRolesEnum.MEMBER,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); //modified will check which field is modified
  this.password = await bcrypt.hash(this.password, 10); //10 means it goes upto 10 salt round(hashing algorithm)
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

//Acess Token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email, //payload
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET, /// env file
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

// refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id, //this was the payload
      email: this.email,
    },
    process.env.REFRESH_TOKEN_SECRET, //thisone is secret
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

//temp tokens  used to verify users or for forgot password email verification
userSchema.methods.generateTemporaryToken = function () {
  const unHashedToken = crypto.randomBytes(20).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");

  const tokenExpiry = Date.now() + 20 * 60 * 1000; //20minutes
  this.forgotPasswordToken = hashedToken;
  this.forgotPasswordExpiry = tokenExpiry;
  this.emailVerificationToken = hashedToken;
  this.emailVerificationExpiry = tokenExpiry;
  return { unHashedToken, hashedToken, tokenExpiry };
};

export const User = mongoose.model("User", userSchema);
