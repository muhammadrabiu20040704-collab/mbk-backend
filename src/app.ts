import express from "express";
import { healthCheck } from "controllers/health.controller.js";

const app = express();

app.use(express.json());

app.use("/", healthCheck);

export default app;
