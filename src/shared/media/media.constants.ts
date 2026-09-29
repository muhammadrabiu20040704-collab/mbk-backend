export const MEDIA_FOLDERS = {
  PROFILE_PICTURES: "mbk/profiles/profile-pictures",
  COVER_PHOTOS: "mbk/profiles/cover-photos",

  POST_IMAGES: "mbk/posts/images",
  POST_VIDEOS: "mbk/posts/videos",

  MESSAGE_IMAGES: "mbk/messages/images",
  MESSAGE_VIDEOS: "mbk/messages/videos",

  PRESENTATION_MEDIA: "mbk/presentations",
  DEBATE_MEDIA: "mbk/debates",
} as const;

export const MEDIA_LIMITS = {
  PROFILE_PICTURE_MAX_SIZE: 5 * 1024 * 1024,
  COVER_PHOTO_MAX_SIZE: 8 * 1024 * 1024,

  POST_IMAGE_MAX_SIZE: 10 * 1024 * 1024,
  POST_VIDEO_MAX_SIZE: 100 * 1024 * 1024,

  MESSAGE_IMAGE_MAX_SIZE: 10 * 1024 * 1024,
  MESSAGE_VIDEO_MAX_SIZE: 100 * 1024 * 1024,
} as const;
