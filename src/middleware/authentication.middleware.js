import asyncHandler from "./../utils/asyncHandler.js";
import tokenModel from "./../../DB/models/token.model.js";
import userModel from "./../../DB/models/user.model.js";
import jwt from "jsonwebtoken";

const isAuthenticated = asyncHandler(async (req, res, next) => {
  // check token existence and type
  let { token } = req.headers;
  if (!token || !token.startsWith(process.env.BEARER_KEY)) {
    return next(new Error("Invalid token!", { cause: 400 }));
  }

  //check payload
  token = token.split(process.env.BEARER_KEY)[1];
  const decoded = jwt.verify(token, process.env.TOKEN_SIGNATURE);
  if (!decoded) return next(new Error("Invalid token!"));

  // check token in DB
  const tokenDB = await tokenModel.findOne({ token });
  if (!tokenDB) return next(new Error("Invalid token!", { cause: 404 }));
  if (!tokenDB.isValid)
    return next(new Error("Token Expired!", { cause: 400 }));

  // check user existence
  console.log();
  const user = await userModel.findOne({ _id: decoded.id });
  if (!user) return next(new Error("User not found!", { cause: 404 }));

  // pass user to request
  req.user = user;

  // response
  return next();
});

export default isAuthenticated;
