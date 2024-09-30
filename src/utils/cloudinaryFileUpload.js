import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file buffer to Cloudinary
 * @param {Buffer} fileBuffer - The buffer of the file (from multer's memory storage)
 * @param {String} fileName - The desired name of the file to be uploaded
 * @returns {Promise<Object>} - The Cloudinary upload response
 */
export const fileUpload = async (fileBuffer, fileName) => {
  try {
    if (!fileBuffer) throw new Error("File buffer is required");

    // Use Cloudinary's upload_stream to handle buffer uploads
    const uploadResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto", public_id: fileName },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        }
      );
      // Write the file buffer to the upload stream
      uploadStream.end(fileBuffer);
    });

    console.log("File upload response:", uploadResponse);
    return uploadResponse;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    throw error;
  }
};

