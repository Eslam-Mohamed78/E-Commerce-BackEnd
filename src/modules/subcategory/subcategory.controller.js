import slugify from "slugify";
import asyncHandler from "../../utils/asyncHandler.js";
import categoryModel from "./../../../DB/models/category.model.js";
import subCategoryModel from "./../../../DB/models/subcategory.model.js";
import cloudinary from "./../../utils/cloud.js";

export const createSubCategory = asyncHandler(async (req, res, next) => {
  // data
  const { name } = req.body;
  const { categoryId } = req.params; // using merge params

  // check file existence before quering the DB
  if (!req.file) return next(new Error("Image is required!", { cause: 400 }));

  // check category
  const category = await categoryModel.findById(categoryId);
  if (!category) return next(new Error("Category not found!", { cause: 404 }));

  // upload file
  const { public_id, secure_url } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.FOLDER_CLOUD_NAME}/subcategory`,
    }
  );

  // save subcategory in DB
  const subcategory = await subCategoryModel.create({
    name,
    slug: slugify(name),
    image: { id: public_id, url: secure_url },
    categoryId,
    createdBy: req.user._id,
  });

  // send response
  return res.json({ success: true, results: subcategory });
});

export const updateSubCategory = asyncHandler(async (req, res, next) => {
  // data
  const { categoryId, subcategoryId } = req.params;
  const name = req.body?.name;

  // check category existence
  const category = await categoryModel.findById(categoryId);
  if (!category) return next(new Error("Category not found!", { cause: 404 }));

  // check subcategory existence
  const subcategory = await subCategoryModel.findById(subcategoryId);
  if (!subcategory)
    return next(new Error("Subcategory not found!", { cause: 404 }));

  // check subcategory owner
  if (subcategory.createdBy.toString() !== req.user._id.toString()) {
    return next(new Error("You are not Authorized (not the owner)!"))
  }

  // check if subcategory belongs to this category
  if (subcategory.categoryId !== categoryId)
    return next(new Error("Subcategory doesn't belong to this category!"));

  // if name found update it & slug
  if (name) {
    subcategory.name = name;
    subcategory.slug = slugify(name);
  }

  // update image
  if (req.file) {
    const { secure_url } = await cloudinary.uploader.upload(req.file.path, {
      public_id: subcategory.image.id,
    });

    // update new url
    subcategory.image.url = secure_url;
  }

  // save all changes to DB
  await subcategory.save();

  // send response
  return res.json({
    success: true,
    message: "Updated Successfully",
    results: subcategory,
  });
});

export const deleteSubCategory = asyncHandler(async (req, res, next) => {
  // data
  const { categoryId, subcategoryId } = req.params;

  // check category existence
  const category = await categoryModel.findById(categoryId);
  if (!category) return next(new Error("Category not found!", { cause: 404 }));

  // check subcategory existence
  const subcategory = await subCategoryModel.findById(subcategoryId);
  if (!subcategory)
    return next(new Error("Subcategory not found!", { cause: 404 }));

  // check subcategory owner
  if (subcategory.createdBy.toString() !== req.user._id.toString()) {
    return next(new Error("You are not Authorized (not the owner)!"))
  }
  
  // check if subcategory belongs to this category
  if (subcategory.categoryId !== categoryId)
    return next(new Error("Subcategory doesn't belong to this category!"));

  // delete image from cloudinary
  const result = await cloudinary.uploader.destroy(subcategory.image.id);
  console.log(result); // has ok if the image deleted
  if (result.result === "not found")
    return next(new Error("Image not found!", { cause: 404 }));

  // delete subcategory from DB
  await subCategoryModel.findByIdAndDelete(subcategoryId);

  return res.json({
    success: true,
    message: "Subcategory deleted successfully",
  });
});

export const allSubCategories = asyncHandler(async (req, res, next) => {
  const subcategories = await subCategoryModel
    .find()
    .populate([
      { path: "categoryId" },
      { path: "createdBy", select: "userName email" },
    ]);

  return res.json({ success: true, results: subcategories });
});
