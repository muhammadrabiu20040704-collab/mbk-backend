import express from "express";
import healthRouter from "./routes/health.route.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { notFoundMiddleware } from "@middleware/not-found.middleware.js";

const app = express();

app.use(express.json());

app.use("/health", healthRouter);
app.use(notFoundMiddleware);

// Error Middleware
app.use(errorMiddleware);

export default app;
