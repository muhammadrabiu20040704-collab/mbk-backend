import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const validateRequest = (schema: z.ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.flatten();

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.fieldErrors,
      });
    }

    req.body = result.data;

    next();
  };
};
