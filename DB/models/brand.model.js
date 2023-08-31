import mongoose, { Schema, Types, model } from "mongoose";

const brandSchema = new Schema(
  {
    name: { type: String, required: true, min: 4, max: 15 },
    slug: { type: String, required: true },
    image: {
      url: { type: String, required: true },
      id: { type: String, required: true },
    },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    categoryId: { type: Types.ObjectId, ref: "Category", required: true },
  },
  { timestamps: true }
);

const brandModel = mongoose.models.Brand || model("Brand", brandSchema);

export default brandModel;
