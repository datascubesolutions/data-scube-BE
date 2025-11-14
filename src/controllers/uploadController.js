const uploadService = require("../services/uploadService");
const logger = require("../utils/logger");

class UploadController {
  // Upload single image
  async uploadSingleImage(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image file provided",
        });
      }

      // Get upload options from request body
      const options = {
        folder: req.body.folder || "datascube",
        tags: req.body.tags ? req.body.tags.split(",") : [],
      };

      // Upload to Cloudinary
      const result = await uploadService.uploadImage(req.file.buffer, options);

      res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
        data: {
          url: result.url,
          publicId: result.publicId,
          format: result.format,
          width: result.width,
          height: result.height,
          size: result.size,
        },
      });
    } catch (error) {
      logger.error("Upload single image error:", error);
      next(error);
    }
  }

  // Upload multiple images
  async uploadMultipleImages(req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No image files provided",
        });
      }

      // Get upload options from request body
      const options = {
        folder: req.body.folder || "datascube",
        tags: req.body.tags ? req.body.tags.split(",") : [],
      };

      // Upload all images
      const results = await uploadService.uploadMultipleImages(
        req.files,
        options
      );

      res.status(200).json({
        success: true,
        message: `${results.length} image(s) uploaded successfully`,
        data: {
          images: results.map((result) => ({
            url: result.url,
            publicId: result.publicId,
            format: result.format,
            width: result.width,
            height: result.height,
            size: result.size,
          })),
          count: results.length,
        },
      });
    } catch (error) {
      logger.error("Upload multiple images error:", error);
      next(error);
    }
  }

  // Delete image
  async deleteImage(req, res, next) {
    try {
      const { publicId } = req.params;

      if (!publicId) {
        return res.status(400).json({
          success: false,
          message: "Public ID is required",
        });
      }

      const result = await uploadService.deleteImage(publicId);

      res.status(200).json({
        success: true,
        message: "Image deleted successfully",
        data: result,
      });
    } catch (error) {
      logger.error("Delete image error:", error);
      next(error);
    }
  }

  // Get image details
  async getImageDetails(req, res, next) {
    try {
      const { publicId } = req.params;

      if (!publicId) {
        return res.status(400).json({
          success: false,
          message: "Public ID is required",
        });
      }

      const result = await uploadService.getImageDetails(publicId);

      res.status(200).json({
        success: true,
        message: "Image details retrieved successfully",
        data: result,
      });
    } catch (error) {
      logger.error("Get image details error:", error);
      next(error);
    }
  }
}

module.exports = new UploadController();
