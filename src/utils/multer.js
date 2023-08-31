import multer, { diskStorage } from "multer";

export const filterObject = {
  image: ["image/png", "image/jpeg"],
  pdf: ["application/pdf"],
  video: ["video/mp4"],
};

export const fileUpload = (filterArray) => {
  const fileFilter = (req, file, cb) => {
    if (!filterArray.includes(file.mimetype)) {
      return cb(new Error("Invalid file format!"), false);
    }
    return cb(null, true);
  };

  const storage = diskStorage({});
  return multer({ storage, fileFilter });
};
