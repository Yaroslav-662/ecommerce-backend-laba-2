import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimiter from "./middleware/rateLimiter.js";
import routes from "./routes/index.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";
import swaggerRouter from "./config/swagger.js";
import { logger } from "./config/logger.js";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import passport from "passport";
import "./config/passport.js";

dotenv.config();
const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev"));
app.use(rateLimiter);
app.use(passport.initialize());

// Static uploads
const uploadDir = process.env.UPLOAD_DIR || "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use("/uploads", express.static(path.resolve(uploadDir)));

// API routes
app.use("/api", routes);

// Swagger
app.use("/api/docs", swaggerRouter);

// Health check
app.get("/", (req, res) => {
  res.status(200).send({
    message: "🛍️ E-commerce API is running",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

// 404
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Global error handler
app.use(errorMiddleware);

export default app;
