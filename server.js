import "./src/config/db.js";
import app from "./src/app.js";
import { logger } from "./src/config/logger.js";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`✅ Server started on port ${PORT}`);
  console.log(`✅ Server started on port ${PORT}`);
});
