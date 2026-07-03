// src/utils/logger.ts
import { createLogger, format, transports } from "winston";
import path from "path";
import fs from "fs";

const { combine, timestamp, json, printf } = format;

function ensureLogDir(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export const getMonthlyLogFilePath = (foldername = "combined"): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return path.join("logs", foldername, `${year}-${month}.log`);
};

const errorLogPath = getMonthlyLogFilePath("error");
const combinedLogPath = getMonthlyLogFilePath("combined");

ensureLogDir(errorLogPath);
ensureLogDir(combinedLogPath);
const consoleFormat = printf(({ level, message, timestamp, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  return `${timestamp} [${level}] ${message}${metaStr}`;
});

const logger = createLogger({
  level: process.env.LOG_LEVEL ?? "info",
  format: combine(timestamp(), json()),
  transports: [
    new transports.Console({
      format: combine(timestamp(), consoleFormat),
    }),
    new transports.File({ filename: errorLogPath, level: "error" }),
    new transports.File({ filename: combinedLogPath }),
  ],
  exitOnError: false,
});

export default logger;
