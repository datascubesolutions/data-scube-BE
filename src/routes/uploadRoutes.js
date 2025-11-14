const express = require("express");
const uploadController = require("../controllers/uploadController");
const upload = require("../middleware/upload");

const router = express.Router();

// Upload single image
// POST /api/upload/image
router.post(
  "/image",
  upload.single("image"),
  uploadController.uploadSingleImage
);

// Upload multiple images
// POST /api/upload/images
router.post(
  "/images",
  upload.array("images", 10),
  uploadController.uploadMultipleImages
);

// Delete image
// DELETE /api/upload/image/:publicId
router.delete("/image/:publicId", uploadController.deleteImage);

// Get image details
// GET /api/upload/image/:publicId
router.get("/image/:publicId", uploadController.getImageDetails);

module.exports = router;
