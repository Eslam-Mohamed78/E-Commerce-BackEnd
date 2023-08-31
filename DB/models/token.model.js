import mongoose, { Schema, model, Types } from "mongoose";

const tokenSchema = new Schema(
  {
    token: {
      type: String,
      required: true,
    },
    user: {
      type: Types.ObjectId,
      ref: "User",
    },
    isValid: {
      type: Boolean,
      default: true,
    },
    // web-mobile
    agent: {
      // agent name
      type: String,
    },
    expiredAt: String,
  },
  { timestamps: true }
);

// model
const tokenModel = mongoose.model.Token || model("Token", tokenSchema);

export default tokenModel;
