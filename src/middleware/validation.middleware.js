import { Types } from "mongoose";

export const isValidObjectId = (value, helper) => {
  return Types.ObjectId.isValid(value)
    ? true
    : helper.message("Invalid objectId!");
};


export const isValid = (schema) => {
  return (req, res, next) => {
    const copyReq = { ...req.body, ...req.params, ...req.query };
    const validationResult = schema.validate(copyReq, { abortEarly: false });

    if (validationResult.error) {
      const messages = validationResult.error.details.map((err) => err.message);
      return next(new Error(messages), { cause: 400 });
    }

    next()
  };
};
