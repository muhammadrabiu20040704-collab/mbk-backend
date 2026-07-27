import dotenv from "dotenv";
import app from "./app.js";
import { env } from "./config/env.js";

dotenv.config();

app.listen(env.PORT, () => {
  console.log(`🚀 MBK Server running on port ${env.PORT}`);
});
