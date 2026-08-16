import { Request, Response, NextFunction } from "express";
import { jwtService } from "../shared/jwt/jwt.service.js";
import { AppError } from "../utils/app-error.js";

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("Unauthorized", 401);
  }

  const parts = authHeader.trim().split(/\s+/);

  if (parts.length !== 2) {
    throw new AppError("Unauthorized", 401);
  }

  const [scheme, token] = parts;

  if (scheme !== "Bearer" || !token) {
    throw new AppError("Unauthorized", 401);
  }

  const payload = jwtService.verifyAccessToken(token);

  req.user = payload;

  next();
};
