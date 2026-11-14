import { extname } from "node:path";
import { MEDIA_LIMITS } from "../../shared/media/media.constants.js";
import { detectMediaType } from "../../shared/media/validation/media-signature.util.js";
import { AppError } from "@utils/app-error.js";

const ALLOWED_IMAGE_FORMATS = new Set(["jpg", "jpeg", "png", "webp"]);

const ALLOWED_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function validatePresentationCover(file: Express.Multer.File): Promise<void> {
  if (!file) {
    throw new AppError("Presentation cover image is required.", 400);
  }

  if (!file.buffer || file.buffer.length === 0) {
    throw new AppError("Cover image is empty or invalid.", 400);
  }

  if (file.size !== file.buffer.length) {
    throw new AppError("Cover image size is invalid.", 400);
  }

  if (file.size > MEDIA_LIMITS.COVER_PHOTO_MAX_SIZE) {
    throw new AppError("Cover image is too large. Maximum size is 8 MB.", 400);
  }

  const detected = await detectMediaType(file.buffer);

  if (!detected || detected.resourceType !== "image") {
    throw new AppError("Only valid image files are allowed.", 400);
  }

  if (
    !ALLOWED_IMAGE_FORMATS.has(detected.extension) ||
    !ALLOWED_IMAGE_MIME_TYPES.has(detected.mimeType)
  ) {
    throw new AppError("This cover image format is not supported.", 400);
  }

  if (file.mimetype !== detected.mimeType) {
    throw new AppError("Cover image MIME type does not match its actual content.", 400);
  }

  const originalExtension = extname(file.originalname).replace(".", "").toLowerCase();

  const validExtension =
    originalExtension === detected.extension ||
    (detected.extension === "jpg" && originalExtension === "jpeg");

  if (!validExtension) {
    throw new AppError("Cover image extension does not match its actual content.", 400);
  }
}
