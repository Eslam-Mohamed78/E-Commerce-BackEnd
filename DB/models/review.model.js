// Product & Reviews is (1 : M) Relationship
// So Embed the reviews in product model is better
// But we need to make feature which is Each user can get all his reviews to any product
// So we will create a separate model for reviews.

import mongoose, { Schema, Types, model } from "mongoose";

const reviewSchema = new Schema(
  {
    content: { type: String, required: true },
    userId: { ref: "User", type: Types.ObjectId, required: true },
  },
  { timestamps: true }
);

const reviewModel = mongoose.models.Review || model("Review", reviewSchema);

export default reviewModel;
