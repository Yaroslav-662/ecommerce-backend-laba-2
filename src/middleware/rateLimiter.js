import rateLimit from "express-rate-limit";
const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000;
const max = Number(process.env.RATE_LIMIT_MAX) || 200;
export default rateLimit({ windowMs, max, standardHeaders: true, legacyHeaders: false });
