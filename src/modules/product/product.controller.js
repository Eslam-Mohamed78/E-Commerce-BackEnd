import asyncHandler from "../../utils/asyncHandler.js";
import { nanoid } from "nanoid";
import cloudinary from "../../utils/cloud.js";
import productModel from "../../../DB/models/product.model.js";
import categoryModel from "../../../DB/models/category.model.js";
import brandModel from "../../../DB/models/brand.model.js";
import subCategoryModel from "../../../DB/models/subcategory.model.js";
import { search } from "../../utils/QueryHelpers.js";

export const addProduct = asyncHandler(async (req, res, next) => {
  const { categoryId, subcategoryId, brandId } = req.body;

  // check category existence
  const category = await categoryModel.findById(categoryId);
  if (!category) return next(new Error("Category not found!", { cause: 404 }));

  // check subcategory existence
  const subcategory = await subCategoryModel.findById(subcategoryId);
  if (!subcategory)
    return next(new Error("Subcategory not found!", { cause: 404 }));

  // check category existence
  const brand = await brandModel.findById(brandId);
  if (!brand) return next(new Error("Brand not found!", { cause: 404 }));

  // check files existence
  if (!req.files)
    return next(new Error("Product images are required!", { cause: 400 }));

  // create unique folder name
  const cloudFolder = nanoid();

  // upload sub files
  let images = [];

  for (const file of req.files.subImages) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      {
        folder: `${process.env.FOLDER_CLOUD_NAME}/products/${cloudFolder}`,
      }
    );
    images.push({ url: secure_url, id: public_id });
  }
  console.log("images", images);

  // upload default image
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.files.defaultImage[0].path,
    { folder: `${process.env.FOLDER_CLOUD_NAME}/products/${cloudFolder}` }
  );

  // create product
  const product = await productModel.create({
    ...req.body,
    cloudFolder,
    createdBy: req.user._id,
    defaultImage: { url: secure_url, id: public_id },
    images, // [{},{}...]
  });

  console.log("product final price", product.finalPrice);

  // send response
  return res.json({ success: true, results: product });
});

export const deleteProduct = asyncHandler(async (req, res, next) => {
  // data
  const { productId } = req.params;

  // check product existence
  const product = await productModel.findById(productId);
  if (!product) return next(new Error("Product not found!", { cause: 404 }));

  // check owner
  if (product.createdBy.toString() !== req.user._id.toString())
    return next(new Error("Not authorized (not the owner)", { cause: 401 }));

  // ====== delete from the cloud =======
  // delete_resources >>> takes array of ids to delete them all
  const ids = product.images.map((img) => img.id); // ids became array
  ids.push(product.defaultImage.id);

  // delete images
  const results = await cloudinary.api.delete_resources(ids);
  console.log(results);

  // delete folder
  // folder must be empty to delete it so we can't make it before deleting images
  await cloudinary.api.delete_folder(
    `${process.env.FOLDER_CLOUD_NAME}/products/${product.cloudFolder}`
  );

  // delete product from DB
  await productModel.findByIdAndDelete(productId);

  // send response
  return res.json({ success: true, message: "Product deleted Successfully!" });
});

export const allProducts = asyncHandler(async (req, res, next) => {
  // data
  const { page, fields, sort } = req.query;
  const { categoryId } = req.params;

  // products of specific category
  if (categoryId) {
    console.log("done");
    const category = await categoryModel.findById(categoryId);

    if (!category)
      return next(new Error("Category not found!", { cause: 404 }));

    const products = await productModel.find({ categoryId });
    return res.json({ success: true, results: products });
  }

  // model keys
  const modelKeys = Object.keys(productModel.schema.paths);

  // spread to filter using strict query in model
  // .find({ ...req.query }) // example: name="Oppo Phone X3"
  // not the best way to search You have to write the full name
  const products = await productModel
    .find(search(modelKeys, req.query)) // example: name="op"
    .paginate(page)
    .customSelect(modelKeys, fields)
    .sort(sort); // note that sort always applied first
  return res.json({ success: true, results: products });
});

export const singleProduct = asyncHandler(async (req, res, next) => {
  // data
  const { productId } = req.params;

  // check product existence
  const product = await productModel.findById(productId);
  if (!product) return next(new Error("Product not found!", { cause: 404 }));

  // response
  return res.json({ success: true, results: product });
});
