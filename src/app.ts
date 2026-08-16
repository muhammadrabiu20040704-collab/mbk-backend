import express from "express";
import helmet from "helmet";
import cors from "cors";

import healthRouter from "./routes/health.route.js";

import { errorMiddleware } from "./middleware/error.middleware.js";
import { notFoundMiddleware } from "@middleware/not-found.middleware.js";
import { generalRateLimiter, authRateLimiter } from "./middleware/rate-limit.middleware.js";

import { authRouter } from "@modules/auth/auth.routes.js";
import userRouter from "@modules/users/user.routes.js";

import { env } from "./config/env.js";

export const app = express();

export const API_PREFIX = "/api/v1";

// ===============================
// SECURITY
// ===============================

app.use(helmet());

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);

// ===============================
// REQUEST LIMITS
// ===============================

app.use(express.json({ limit: "1mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  }),
);

// ===============================
// GENERAL RATE LIMIT
// ===============================

app.use(generalRateLimiter);

// ===============================
// HEALTH
// ===============================

app.use("/health", healthRouter);

// ===============================
// AUTH
// ===============================

app.use(`${API_PREFIX}/auth`, authRateLimiter, authRouter);

// ===============================
// USERS
// ===============================

app.use(`${API_PREFIX}/users`, userRouter);

// ===============================
// NOT FOUND
// ===============================

app.use(notFoundMiddleware);

// ===============================
// ERROR HANDLER
// ===============================

app.use(errorMiddleware);

export default app;
