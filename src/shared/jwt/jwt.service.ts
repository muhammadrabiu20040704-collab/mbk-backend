import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { AppError } from "../../utils/app-error.js";
import type { JwtPayload } from "./jwt.types.js";
import { z } from "zod";

const jwtPayloadSchema = z.object({
  sub: z.string(),
  username: z.string(),
});

export class JwtService {
  generateAccessToken(payload: JwtPayload) {
    return jwt.sign(payload, env.JWT_SECRET as string, {
      expiresIn: env.JWT_EXPIRES_IN,
    });
  }
  generateRefreshToken(payload: JwtPayload) {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: "30d",
    });
  }
  verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch {
      throw new AppError("Unauthorized", 401);
    }
  }
  verifyRefreshToken(token: string): JwtPayload {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    return jwtPayloadSchema.parse(decoded);
  }
}

export const jwtService = new JwtService();
