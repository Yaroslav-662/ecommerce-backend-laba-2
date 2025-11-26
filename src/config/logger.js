import winston from "winston";
import fs from "fs";
if (!fs.existsSync("logs")) fs.mkdirSync("logs");

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/app.log" }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});
