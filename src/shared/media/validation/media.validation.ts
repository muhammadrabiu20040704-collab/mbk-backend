import { extname } from "node:path";
import { MEDIA_LIMITS } from "../media.constants.js";
import { detectMediaType } from "./media-signature.util.js";
import { AppError } from "@utils/app-error.js";

type MessageMediaResourceType = "image" | "video";

export interface MediaValidationResult {
  resourceType: MessageMediaResourceType;
  extension: string;
  mimeType: string;
}

const ALLOWED_IMAGE_FORMATS = new Set(["jpg", "jpeg", "png", "webp"]);

const ALLOWED_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const ALLOWED_VIDEO_FORMATS = new Set(["mp4", "mov", "webm"]);

const ALLOWED_VIDEO_MIME_TYPES = new Set(["video/mp4", "video/quicktime", "video/webm"]);

export async function validateMessageMedia(
  file: Express.Multer.File,
): Promise<MediaValidationResult> {
  // 1. Make sure a file was provided.
  if (!file) {
    throw new AppError("Media file is required.", 400);
  }

  // 2. Make sure the buffer exists and is not empty.
  if (!file.buffer || file.buffer.length === 0) {
    throw new AppError("Media file is empty or invalid.", 400);
  }

  // 3. Make sure Multer's reported size matches the actual buffer size.
  if (file.size !== file.buffer.length) {
    throw new AppError("Media file size is invalid.", 400);
  }

  // 4. Detect the REAL file type from its binary signature.
  const detected = await detectMediaType(file.buffer);

  if (!detected) {
    throw new AppError("Unsupported or invalid media file.", 400);
  }

  // 5. Extract the extension from the original filename.
  const originalExtension = extname(file.originalname).replace(".", "").toLowerCase();

  // 6. Validate image files.
  if (detected.resourceType === "image") {
    if (!ALLOWED_IMAGE_FORMATS.has(detected.extension)) {
      throw new AppError("This image format is not supported.", 400);
    }

    if (!ALLOWED_IMAGE_MIME_TYPES.has(detected.mimeType)) {
      throw new AppError("This image MIME type is not supported.", 400);
    }

    if (file.size > MEDIA_LIMITS.MESSAGE_IMAGE_MAX_SIZE) {
      throw new AppError("Image file is too large. Maximum size is 10 MB.", 400);
    }
  }

  // 7. Validate video files.
  if (detected.resourceType === "video") {
    if (!ALLOWED_VIDEO_FORMATS.has(detected.extension)) {
      throw new AppError("This video format is not supported.", 400);
    }

    if (!ALLOWED_VIDEO_MIME_TYPES.has(detected.mimeType)) {
      throw new AppError("This video MIME type is not supported.", 400);
    }

    if (file.size > MEDIA_LIMITS.MESSAGE_VIDEO_MAX_SIZE) {
      throw new AppError("Video file is too large. Maximum size is 50 MB.", 400);
    }
  }

  // 8. Make sure the client's MIME type matches
  //    the MIME type detected from the actual file.
  if (file.mimetype !== detected.mimeType) {
    throw new AppError("File MIME type does not match its actual content.", 400);
  }

  // 9. Make sure the filename extension matches
  //    the actual detected file format.
  const validExtension =
    originalExtension === detected.extension ||
    (detected.extension === "jpg" && originalExtension === "jpeg");

  if (!validExtension) {
    throw new AppError("File extension does not match its actual content.", 400);
  }

  // 10. Return trusted information.
  return {
    resourceType: detected.resourceType,
    extension: detected.extension,
    mimeType: detected.mimeType,
  };
}
