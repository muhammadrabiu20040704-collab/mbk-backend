import app from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./database/connection.js";

async function startServer() {
  try {
    await connectDatabase();

    app.listen(env.PORT, () => {
      console.log(`🚀 MBK Server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
