import { cloudinary } from "./cloudinary.config.js";
import type { UploadedMedia, MediaResourceType } from "./media.types.js";

export class MediaService {
  async upload(
    buffer: Buffer,
    folder: string,
    resourceType: MediaResourceType = "image",
  ): Promise<UploadedMedia> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error("Media upload failed."));
            return;
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            resourceType: result.resource_type as MediaResourceType,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          });
        },
      );

      uploadStream.end(buffer);
    });
  }

  async delete(publicId: string, resourceType: MediaResourceType = "image"): Promise<void> {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  }
}

export const mediaService = new MediaService();
