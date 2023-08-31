import mongoose, { Types, Schema, model } from "mongoose";

const cartSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    products: [
      {
        _id: false,
        productId: { type: Types.ObjectId, ref: "Product", unique: true },
        quantity: { type: Number, default: 1 },
      },
    ],
  },
  { timestamps: true }
);

const cartModel = mongoose.models.Cart || model("Cart", cartSchema);

export default cartModel;
