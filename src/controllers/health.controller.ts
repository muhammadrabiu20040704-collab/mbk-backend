import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler.js";

export const healthCheck = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    message: "MBK Backend is running 🚀",
    version: "1.0.0",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});
