import multer from "multer";
import type { FileFilterCallback } from "multer";
import type { Request } from "express";

const storage = multer.memoryStorage();

const imageFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback,
): void => {
  if (!file.mimetype.startsWith("image/")) {
    callback(new Error("Only image files are allowed."));
    return;
  }

  callback(null, true);
};

export const profileImageUpload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
});
