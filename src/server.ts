import http from "node:http";
import app from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./database/connection.js";
import { initializeSocket } from "./sockets/socket.server.js";

async function startServer() {
  try {
    await connectDatabase();

    const httpServer = http.createServer(app);

    initializeSocket(httpServer);

    httpServer.listen(env.PORT, () => {
      console.log(`🚀 MBK Server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
