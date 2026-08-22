export type MediaResourceType = "image" | "video";

export interface UploadedMedia {
  url: string;
  publicId: string;
  resourceType: MediaResourceType;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}
