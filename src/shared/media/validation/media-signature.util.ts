import { fileTypeFromBuffer } from "file-type";

export interface DetectedMediaType {
  extension: string;
  mimeType: string;
  resourceType: "image" | "video";
}

export async function detectMediaType(buffer: Buffer): Promise<DetectedMediaType | null> {
  const detected = await fileTypeFromBuffer(buffer);

  if (!detected) {
    return null;
  }

  if (detected.mime.startsWith("image/")) {
    return {
      extension: detected.ext,
      mimeType: detected.mime,
      resourceType: "image",
    };
  }

  if (detected.mime.startsWith("video/")) {
    return {
      extension: detected.ext,
      mimeType: detected.mime,
      resourceType: "video",
    };
  }

  return null;
}
