import path from "path";
import express from "express";
import multer from "multer";
import imagekit from "../services/imagekit-cdn.js";

const router = express.Router();

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const filetypes = /jpe?g|png|webp/;
  const mimetypes = /image\/jpe?g|image\/png|image\/webp/;

  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  if (filetypes.test(extname) && mimetypes.test(mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Images only"), false);
  }
};

const upload = multer({ storage, fileFilter });
const uploadSingleImage = upload.single("image");

router.post("/", uploadSingleImage, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ message: "No image file provided" });
    }

    // Convert file buffer to base64 with data URI prefix
    const fileBase64 = `data:${
      req.file.mimetype
    };base64,${req.file.buffer.toString("base64")}`;

    const response = await imagekit.upload({
      file: fileBase64,
      fileName: req.file.originalname,
      folder: "/azushop",
      useUniqueFileName: true,
      isPrivateFile: false,
    });

    return res.status(200).send({
      message: "Image uploaded successfully",
      image: response.url,
    });
  } catch (error) {
    console.error(
      "ImageKit error:",
      error,
      error?.message,
      error?.response?.data
    );
    res.status(500).send({ message: "Image upload failed", error });
  }
});

export default router;

