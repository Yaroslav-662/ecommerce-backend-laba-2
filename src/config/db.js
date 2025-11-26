import mongoose from "mongoose";
import dotenv from "dotenv";
import { logger } from "./logger.js";
dotenv.config();

const uri = process.env.MONGO_URI || "mongodb://localhost:27017/cosmetics_shop";
mongoose.connect(uri)
  .then(() => logger.info("MongoDB connected"))
  .catch(err => { logger.error("MongoDB connection error", err); process.exit(1); });
