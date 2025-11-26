// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

/**
 * ✅ Middleware: Перевірка JWT токена
 * Використовується для захисту приватних маршрутів
 */
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Перевіряємо наявність заголовка з токеном
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Розшифровуємо токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Додаємо дані користувача до запиту
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

/**
 * ✅ Middleware: Перевірка ролі адміністратора
 * Дозволяє доступ лише користувачам з роллю "admin"
 */
export const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    next();
  } catch (err) {
    console.error("Admin check error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
