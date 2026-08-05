import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { AppError } from "../../utils/app-error.js";
import type { JwtPayload } from "./jwt.types.js";

export class JwtService {
  generateAccessToken(payload: JwtPayload) {
    return jwt.sign(payload, env.JWT_SECRET as string, {
      expiresIn: env.JWT_EXPIRES_IN,
    });
  }
  verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch {
      throw new AppError("Unauthorized", 401);
    }
  }
}

export const jwtService = new JwtService();
