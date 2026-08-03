import express from "express";

import healthRouter from "./routes/health.route.js";

import { errorMiddleware } from "./middleware/error.middleware.js";
import { notFoundMiddleware } from "@middleware/not-found.middleware.js";

import { authRouter } from "@modules/auth/auth.routes.js";

export const app = express();

export const API_PREFIX = "/api/v1";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/health", healthRouter);
app.use(`${API_PREFIX}/auth`, authRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
