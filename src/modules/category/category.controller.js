import slugify from "slugify";
import asyncHandler from "../../utils/asyncHandler.js";
import categoryModel from "./../../../DB/models/category.model.js";
import cloudinary from "../../utils/cloud.js";
import subCategoryModel from "../../../DB/models/subcategory.model.js";

export const createCategory = asyncHandler(async (req, res, next) => {
  // data
  const { name } = req.body;
  const createdBy = req.user._id;

  // file upload to cloud
  if (!req.file) return next(new Error("Category image is required!"));
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.FOLDER_CLOUD_NAME}/category`,
    }
  );

  // save category in DB
  const category = await categoryModel.create({
    name,
    createdBy,
    image: { id: public_id, url: secure_url },
    slug: slugify(name),
  });

  // send response
  return res.status(201).json({ success: true, results: category });
});

export const updateCategory = asyncHandler(async (req, res, next) => {
  // data
  const { categoryId } = req.params;
  console.log(categoryId);

  // check category existence
  const category = await categoryModel.findById(categoryId);
  if (!category) return next(new Error("Category not found!", { cause: 404 }));

  // check category owner
  if (category.createdBy.toString() !== req.user._id.toString()) {
    return next(new Error("You are not Authorized (not the owner)!"));
  }

  // if name found update name & slug
  if (req.body.name) {
    category.name = req.body.name;
    category.slug = slugify(req.body.name);
  }

  // upload file if found
  if (req.file) {
    const { secure_url } = await cloudinary.uploader.upload(req.file.path, {
      public_id: category.image.id,
    });

    // update new url
    category.image.url = secure_url;
  }

  // save all changes to DB
  await category.save();

  // send response
  return res.json({ success: true });
});

export const deleteCategory = asyncHandler(async (req, res, next) => {
  // data
  const { categoryId } = req.params;

  // check category existence
  const category = await categoryModel.findById(categoryId);
  if (!category) return next(new Error("Category not found!", { cause: 404 }));

  // check category owner
  if (category.createdBy.toString() !== req.user._id.toString()) {
    return next(new Error("You are not Authorized (not the owner)!"));
  }

  // delete image from cloudinary
  const result = await cloudinary.uploader.destroy(category.image.id);
  console.log(result); // has ok if the image deleted
  if (result.result === "not found")
    return next(new Error("Image not found!", { cause: 404 }));

  // delete category from DB
  // await category.remove()
  await categoryModel.findByIdAndDelete(categoryId);

  // delete all related subcategories(could be another senario)
  await subCategoryModel.deleteMany({ createdBy: category._id });

  // send result
  return res.json({ success: true, message: "category deleted!" });
});

export const allCategories = asyncHandler(async (req, res, next) => {
  const categories = await categoryModel.find().populate({
    path: "subcategory",
    populate: [{ path: "createdBy" }],
  });

  console.log(categories); // toObject: true

  return res.json({ success: true, results: categories }); // toJSON: true
});
