/* eslint-disable @typescript-eslint/no-unused-vars */
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { apiRoute } from "./core/interfaces/https/routes/api";
import { AppError, globalErrorHandler } from "./utils/error-handler";
import { telegramLogger } from "./utils/telegram-logger";
import { log } from "./utils/logger";

dotenv.config();

const app: Express = express();
const port: string | number = process.env.PORT || 3000;

const corsOrigin = {
  origin: "*", //or whatever port your frontend is using
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOrigin));
app.use(express.json({ limit: "50mb", type: "application/json" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// File Middleware
app.use(
  "/avatars",
  express.static(path.join(__dirname, "./storage/uploads/avatars"))
);
app.use(
  "/logos",
  express.static(path.join(__dirname, "./storage/uploads/logos"))
);
app.use(
  "/banners",
  express.static(path.join(__dirname, "./storage/uploads/banners"))
);
app.use("/public", express.static(path.join(__dirname, "../public")));

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the API!");
});
app.get("/test-error", () => {
  // throw new AppError("This is a test error", 400);
  try {
    log.info("User logged in", { userId: 123, ip: "192.168.1.1" });
    throw new Error("Simulated error for testing");
  } catch (error) {
    log.error(error as Error, {
      operation: "user_login",
      userId: 123,
      authToken: "secret-token-here",
    });
  }
});

app.use("/api", apiRoute);

// Global error handler
app.use(globalErrorHandler);

process.on(
  "unhandledRejection",
  (reason: Error | any, promise: Promise<any>) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    telegramLogger.logError(
      reason instanceof Error ? reason : new Error(JSON.stringify(reason)),
      { type: "unhandledRejection" }
    );
    process.exit(1);
  }
);

process.on("uncaughtException", (error: Error) => {
  console.error("Uncaught Exception:", error);
  telegramLogger.logError(error, { type: "uncaughtException" });
  process.exit(1);
});

app.listen(port, () => {
  console.log(`[Server]: Server is listening at https://localhost:${port}`);
});
