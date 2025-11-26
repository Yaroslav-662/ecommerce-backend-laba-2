import { logger } from "../config/logger.js";

export const errorMiddleware = (err, req, res, next) => {
  logger.error(err.stack || err.message || err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Internal Server Error" });
};
