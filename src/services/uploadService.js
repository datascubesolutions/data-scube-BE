const cloudinary = require("../config/cloudinary");
const logger = require("../utils/logger");

class UploadService {
  /**
   * Upload image to Cloudinary
   * @param {Buffer} fileBuffer - File buffer from multer
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result with URL
   */
  async uploadImage(fileBuffer, options = {}) {
    try {
      return new Promise((resolve, reject) => {
        const uploadOptions = {
          folder: options.folder || "datascube",
          resource_type: "image",
          transformation: options.transformation || [
            { width: 1000, height: 1000, crop: "limit" },
            { quality: "auto" },
            { fetch_format: "auto" },
          ],
          ...options,
        };

        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              logger.error("Cloudinary upload error:", error);
              reject(error);
            } else {
              logger.info(`Image uploaded successfully: ${result.public_id}`);
              resolve({
                url: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                width: result.width,
                height: result.height,
                size: result.bytes,
                createdAt: result.created_at,
              });
            }
          }
        );

        uploadStream.end(fileBuffer);
      });
    } catch (error) {
      logger.error("Upload service error:", error);
      throw error;
    }
  }

  /**
   * Upload multiple images
   * @param {Array} files - Array of file buffers
   * @param {Object} options - Upload options
   * @returns {Promise<Array>} Array of upload results
   */
  async uploadMultipleImages(files, options = {}) {
    try {
      const uploadPromises = files.map((file) =>
        this.uploadImage(file.buffer, options)
      );
      return await Promise.all(uploadPromises);
    } catch (error) {
      logger.error("Multiple upload error:", error);
      throw error;
    }
  }

  /**
   * Delete image from Cloudinary
   * @param {String} publicId - Cloudinary public ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteImage(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      logger.info(`Image deleted: ${publicId}`);
      return result;
    } catch (error) {
      logger.error("Delete image error:", error);
      throw error;
    }
  }

  /**
   * Get image details
   * @param {String} publicId - Cloudinary public ID
   * @returns {Promise<Object>} Image details
   */
  async getImageDetails(publicId) {
    try {
      const result = await cloudinary.api.resource(publicId);
      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        size: result.bytes,
        createdAt: result.created_at,
      };
    } catch (error) {
      logger.error("Get image details error:", error);
      throw error;
    }
  }

  /**
   * Generate transformation URL
   * @param {String} publicId - Cloudinary public ID
   * @param {Object} transformation - Transformation options
   * @returns {String} Transformed image URL
   */
  getTransformedUrl(publicId, transformation) {
    return cloudinary.url(publicId, {
      transformation: transformation,
      secure: true,
    });
  }
}

module.exports = new UploadService();
