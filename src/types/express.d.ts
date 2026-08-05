import "express";
import type { JwtPayload } from "../shared/jwt/jwt.types.js";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export {};
