// backend/src/server.ts
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";

import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import callRoutes from "./routes/callRoutes.js";

import { setGlobalTypes } from "./utils/setupTypes.js";
import { prisma } from "./prismaDB/client.js";
import logger from "./utils/logger.js";
import responseMiddleware from "./middleware/response.js";
import { setSecurityHeaders } from "./middleware/securityHeaders.js";
import { setupSockets } from "./sockets/socket.handler.js";

setGlobalTypes?.(); // optional: ensure global type augmentation loaded
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    credentials: true,
    origin: process.env.FRONTEND_URL,
  },
});

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
// app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
// Security and sanitization pipeline
app.use(setSecurityHeaders);
app.use(responseMiddleware); // attach res.success / res.fail

// // Static uploads serving (secure headers set)
// app.use(
//   "/uploads",
//   express.static(path.join(process.cwd(), "uploads"), {
//     index: false,
//     dotfiles: "deny",
//     setHeaders: (res) => {
//       res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
//       res.setHeader("X-Content-Type-Options", "nosniff");
//       res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
//     },
//   })
// );

app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/calls", callRoutes);

// Health check
app.get("/healthz", (_req, res) => res.success("ok"));

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: "مسیر مورد نظر یافت نشد" });
});

// Centralized error handler (typed)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error(`Global error: ${err?.message ?? err}`, { stack: err?.stack });
  const status = err?.status || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "خطایی رخ داده است. لطفا بعداً تلاش کنید."
      : err?.message ?? "خطای سرور";
  res.status(status).json({ message });
});

// بعد از ایجاد io:
app.set("io", io);

// console.log("before setupSockets(io);");
// Socket.IO
setupSockets(io);
// console.log("after setupSockets(io);");

const PORT = process.env.PORT || 4000;

async function connectDatabase() {
  try {
    await prisma.$connect();
    logger.info("Prisma connected to database");
  } catch (err: any) {
    logger.error("Database connection failed: " + (err?.message ?? err), { stack: err?.stack });
    throw err;
  }
}

async function start() {
  try {
    await connectDatabase();
    httpServer.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    logger.error(
      err && (err as any)?.message ? "Failed to start server: " + (err as any)?.message : err
    );
    process.exit(1);
  }
}

start();

// Graceful shutdown
const shutdown = async (signal: string) => {
  try {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    httpServer.close(async (err) => {
      if (err) {
        logger.error("Error closing server", { err });
        process.exit(1);
      }
      try {
        await prisma.$disconnect();
        logger.info("Prisma disconnected");
      } catch (e) {
        logger.error("Error disconnecting prisma", { e });
      }
      process.exit(0);
    });
    // force exit after timeout
    setTimeout(() => {
      logger.warn("Forcing shutdown after timeout");
      process.exit(1);
    }, 30_000).unref();
  } catch (e) {
    logger.error("Shutdown error", { e });
    process.exit(1);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("uncaughtException", (err) => {
  logger.error("uncaughtException", { err });
  shutdown("uncaughtException");
});
process.on("unhandledRejection", (reason) => {
  logger.error("unhandledRejection", { reason });
});
