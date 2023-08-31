import { Schema, Types, model, mongoose } from "mongoose";

const subCategorySchema = new Schema(
  {
    name: { type: String, required: true, min: 5, max: 20 },
    slug: { type: String, required: true },
    image: {
      id: { type: String, required: true },
      url: { type: String, required: true },
    },
    categoryId: {
      type: Types.ObjectId,
      ref: "Category",
      required: true,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    brandId: [{ type: Types.ObjectId, ref: "Brand" }],
  },
  { timestamps: true }
);

const subCategoryModel =
  mongoose.models.subCategoryModel || model("Subcategory", subCategorySchema);

export default subCategoryModel;
