import dotenv from "dotenv";

dotenv.config();

function required(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  PORT: Number(process.env.PORT) || 5000,

  NODE_ENV: process.env.NODE_ENV || "development",

  MONGODB_URI: required(process.env.MONGODB_URI, "MONGODB_URI"),

  JWT_SECRET: required(process.env.JWT_SECRET, "JWT_SECRET"),

  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  REDIS_URL: process.env.REDIS_URL || "redis://127.0.0.1:6379",

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",

  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",

  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",

  RABBITMQ_URL: process.env.RABBITMQ_URL || "amqp://localhost",

  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
};
