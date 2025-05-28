import { NextFunction, Request, Response } from "express";
import { log } from "./logger";

export class AppError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const globalErrorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;

  if (statusCode >= 500) {
    log.critical(err, {
      path: req.path,
      method: req.method,
      body: req.body,
      headers: req.headers,
    });
  } else {
    log.error(err, {
      path: req.path,
      method: req.method,
      body: req.body,
    });
  }

  res.status(statusCode).json({
    status: "error",
    message: err.message,
  });
};
