import { uploadFileToS3 } from "./s3Upload";

const URI = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

/** Upload a file to S3 and return its public URL, or null on failure (same helper the partner panel uses). */
export const uploadToS3 = async (file) => {
  try {
    return await uploadFileToS3(URI, file);
  } catch (err) {
    console.error("S3 upload failed:", err);
    return null;
  }
};
