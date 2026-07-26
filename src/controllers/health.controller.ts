import { Request, Response } from "express";

export const healthCheck = (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: "MBK Backend is running 🚀",

    version: "1.0.0",

    environment: process.env.NODE_ENV,

    timestamp: new Date().toISOString(),
  });
};
