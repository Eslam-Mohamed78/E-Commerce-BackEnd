import productModel from "../../../DB/models/product.model.js";
import reviewModel from "../../../DB/models/review.model.js";
import asyncHandler from "../../utils/asyncHandler.js";

export const addReview = asyncHandler(async (req, res, next) => {
  // data
  const { content, productId } = req.body;
  const userId = req.user._id;

  // add review to model
  const review = await reviewModel.create({
    content,
    userId,
  });

  // add review to product
  const product = await productModel.findOneAndUpdate(productId, {
    $push: { reviews: { reviewId: review._id } },
  });

  // send response
  return res.json({ success: true, message: "Review added successfully!" });
});
