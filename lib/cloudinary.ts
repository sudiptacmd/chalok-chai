import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Compress and upload an image to Cloudinary
 * @param file - The file to upload (base64 string or buffer)
 * @param folder - The folder to upload to in Cloudinary
 * @param options - Additional options for the upload
 */
export async function uploadImageToCloudinary(
  file: string | Buffer,
  folder: string = "chalok-chai",
  options: {
    width?: number;
    height?: number;
    quality?: "auto" | number;
    format?: string;
  } = {}
) {
  try {
    const {
      width = 800,
      height = 600,
      quality = "auto",
      format = "auto",
    } = options;

    const uploadOptions = {
      folder,
      transformation: [
        {
          width,
          height,
          crop: "limit",
          quality,
          format,
          fetch_format: "auto",
        },
      ],
      resource_type: "auto" as const,
    };

    let result: {
      public_id: string;
      secure_url: string;
      width?: number;
      height?: number;
      format?: string;
      bytes?: number;
    };
    if (typeof file === "string") {
      // If file is a base64 string
      result = await cloudinary.uploader.upload(file, uploadOptions);
    } else {
      // If file is a buffer
      result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(uploadOptions, (error, result) => {
            if (error) reject(error);
            else if (result) resolve(result);
            else reject(new Error("Upload failed"));
          })
          .end(file);
      });
    }

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * Delete an image from Cloudinary
 * @param publicId - The public ID of the image to delete
 */
export async function deleteImageFromCloudinary(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === "ok",
      result: result.result,
    };
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
}

/**
 * Process and compress image from FormData
 * @param formData - The FormData containing the image file
 * @param fieldName - The name of the file field
 */
export function processImageFromFormData(
  formData: FormData,
  fieldName: string = "image"
) {
  const file = formData.get(fieldName) as File;

  if (!file || file.size === 0) {
    return null;
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed."
    );
  }

  // Validate file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error("File size too large. Maximum size is 5MB.");
  }

  return file;
}

/**
 * Convert File to base64 string
 * @param file - The File object to convert
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export default cloudinary;
