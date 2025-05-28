import winston from "winston";
import { telegramLogger } from "./telegram-logger";

const levels = {
  critical: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
};

const logger = winston.createLogger({
  levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
    }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

export const log = {
  critical: (error: Error, context?: Record<string, unknown>) => {
    logger.log('critical', error.message, { error, ...context });
    telegramLogger.logCritical(error, context);
  },
  error: (error: Error, context?: Record<string, unknown>) => {
    logger.error(error.message, { error, ...context });
    telegramLogger.logError(error, context);
  },
  warn: (message: string | Error, context?: Record<string, unknown>) => {
    logger.warn(
      typeof message === "string" ? message : message.message,
      context
    );
    telegramLogger.logWarning(message, context);
  },
  info: (message: string, context?: Record<string, unknown>) => {
    logger.info(message, context);
    telegramLogger.logInfo(message, context);
  },
};
