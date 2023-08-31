import slugify from "slugify";
import asyncHandler from "../../utils/asyncHandler.js";
import brandModel from "./../../../DB/models/brand.model.js";
import categoryModel from "./../../../DB/models/category.model.js";
import cloudinary from "../../utils/cloud.js";

export const createBrand = asyncHandler(async (req, res, next) => {
  // data
  const { name, categoryId } = req.body;
  const createdBy = req.user._id;

  // check category existence
  const category = await categoryModel.findById(categoryId);
  if (!category) return next(new Error("Category Not found!", { cause: 404 }));

  // file upload to cloud
  if (!req.file) return next(new Error("Brand image is required!"));
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.FOLDER_CLOUD_NAME}/brand`,
    }
  );

  // save brand in DB
  const brand = await brandModel.create({
    name,
    image: { id: public_id, url: secure_url },
    slug: slugify(name),
    createdBy,
    categoryId
  });

  // send response
  return res.status(201).json({ success: true, results: brand });
});

export const updateBrand = asyncHandler(async (req, res, next) => {
  // data
  const { brandId } = req.params;

  // check brand existence
  const brand = await brandModel.findById(brandId);
  if (!brand) return next(new Error("Brand not found!", { cause: 404 }));

  // check brand owner
  if (brand.createdBy.toString() !== req.user._id.toString()) {
    return next(new Error("You are not Authorized (not the owner)!"));
  }

  // if name found update name & slug
  if (req.body.name) {
    brand.name = req.body.name;
    brand.slug = slugify(req.body.name);
  }

  // upload file if found
  if (req.file) {
    const { secure_url } = await cloudinary.uploader.upload(req.file.path, {
      public_id: brand.image.id,
    });

    // update new url
    brand.image.url = secure_url;
  }

  // save all changes to DB
  await brand.save();

  // send response
  return res.json({
    success: true,
    message: "Brand Updated Successfully",
    results: brand,
  });
});

export const deleteBrand = asyncHandler(async (req, res, next) => {
  // data
  const { brandId } = req.params;

  // check brand existence
  const brand = await brandModel.findById(brandId);
  if (!brand) return next(new Error("Brand not found!", { cause: 404 }));

  // check brand owner
  if (brand.createdBy.toString() !== req.user._id.toString()) {
    return next(new Error("You are not Authorized (not the owner)!"));
  }

  // delete image from cloudinary
  const result = await cloudinary.uploader.destroy(brand.image.id);
  console.log(result); // has ok if the image deleted
  if (result.result === "not found")
    return next(new Error("Image not found!", { cause: 404 }));

  // delete brand from DB
  await brandModel.findByIdAndDelete(brandId);

  // send result
  return res.json({ success: true, message: "Brand deleted Successfully!" });
});

export const allBrands = asyncHandler(async (req, res, next) => {
  const Brands = await brandModel.find();

  return res.json({ success: true, results: Brands });
});
