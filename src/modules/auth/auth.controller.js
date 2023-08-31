import asyncHandler from "./../../utils/asyncHandler.js";
import userModel from "./../../../DB/models/user.model.js";
import tokenModel from "../../../DB/models/token.model.js";
import cartModel from "../../../DB/models/cart.model.js";
import { resetPassTemplate, signUpTemplate } from "../../utils/generateHtml.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import sendEmail from "../../utils/sendEmail.js";
import jwt from "jsonwebtoken";

import randomstring from "randomstring";

export const register = asyncHandler(async (req, res, next) => {
  // data from request
  const { userName, email, password } = req.body;
  console.log({ userName, email, password });

  // check user existence
  const isUser = await userModel.findOne({ email });
  if (isUser) {
    return next(new Error("Email Already Exists", { cause: 409 }));
  }

  // hash password
  const hashPassword = bcrypt.hashSync(
    password,
    Number(process.env.SALT_ROUND)
  );

  // generate activationCode or generate token with payload email & pass ...
  const activationCode = crypto.randomBytes(64).toString("hex");

  // create user
  const user = await userModel.create({
    userName,
    email,
    password: hashPassword,
    activationCode,
  });

  // create confiramtionLink
  const link = `${req.protocol}://${req.headers.host}/auth/confirmEmail/${activationCode}`;

  // send Email
  const isSent = await sendEmail({
    to: email,
    subject: "Activation Account",
    html: signUpTemplate(link),
  });

  // send response
  return isSent
    ? res.json({ success: true, message: "Check your Email!" })
    : next(new Error("Something went wrong!"));
});

export const activateAccount = asyncHandler(async (req, res, next) => {
  // find user, delete activationCode, update isConfirmed
  const { activationCode } = req.params;
  const user = await userModel.findOneAndUpdate(
    { activationCode },
    {
      isConfirmed: true,
      $unset: { activationCode: 1 },
    }
  );

  // check if the user doesn't exist
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }

  // create a cart
  await cartModel.create({ user: user._id });

  // send response
  return res.json("Congrats, your account is activated successfully");
});

export const login = asyncHandler(async (req, res, next) => {
  // data from request
  const { email, password } = req.body;
  console.log({ email, password });

  // check user existence
  const user = await userModel.findOne({ email });
  if (!user) {
    return next(new Error("User not Found", { cause: 404 }));
  }

  // check isConfirmed
  if (!user.isConfirmed) {
    return next(new Error("Account Not Confirmed", { cause: 400 }));
  }

  // check the password correctness
  const match = bcrypt.compareSync(password, user.password);
  if (!match) {
    return next(new Error("Invalid Login Data"));
  }

  // generate the token
  const token = jwt.sign(
    { userName: user.userName, email: user.email, id: user._id },
    process.env.TOKEN_SIGNATURE,
    { expiresIn: "2d" }
  );

  // save token in tokenModel
  await tokenModel.create({
    token,
    user: user._id,
    agent: req.headers["user-agent"],
  });

  // change user status to online and save changes OR make update request
  user.status = "online";
  await user.save();

  // send response
  return res.json({ success: true, results: token });
});

export const sendForgetCode = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  console.log(email);

  // check user existence
  let user = await userModel.findOne({ email });
  if (!user) {
    return next(new Error("Account Not Exists", { cause: 404 }));
  }

  // generat code
  const code = randomstring.generate({
    length: 5,
    charset: "numeric",
  });

  // store code in DB
  user.forgetCode = code;
  await user.save();

  // send confirm code
  return (await sendEmail({
    to: email,
    subject: "Reset Password Code",
    html: resetPassTemplate(code),
  }))
    ? res.json({ success: true, message: "Check your email!" })
    : next(new Error("Something went wrong!!"));
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { forgetCode, email, password } = req.body;
  console.log({ forgetCode, email, password });

  // check user existence
  let user = await userModel.findOne({ email });
  if (!user) {
    return next(new Error("Account Not Exists!", { cause: 404 }));
  }

  // check code correctness
  if (user.forgetCode !== forgetCode) {
    return next(new Error("Invalid Code!"));
  }

  // delete code from user
  // OR you can store code as {value: "", isValid: false} for multi codes approach
  user = await userModel.findOneAndUpdate(
    { email },
    { $unset: { forgetCode: 1 } }
  );

  // update password
  user.password = bcrypt.hashSync(password, Number(process.env.SALT_ROUND));
  await user.save();

  // Invalidate tokens to be not valid in all devices
  const tokens = await tokenModel.find({ user: user._id });
  tokens.forEach(async (token) => {
    token.isValid = false;
    await token.save();
  });

  // send response
  return res.json({ success: true, message: "Try to login !" });
});
