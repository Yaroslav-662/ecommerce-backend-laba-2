import express from "express";
import {
  getReviews,
  createReview,
  deleteReview,
} from "../controllers/reviewController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { isAdminOrAuthor } from "../middleware/adminMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Відгуки користувачів
 */

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: Отримати всі відгуки (підтримка фільтрації по product)
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: product
 *         schema: { type: string }
 *         description: ID товару
 *     responses:
 *       200:
 *         description: Список відгуків
 *   post:
 *     summary: Додати відгук до товару
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product: { type: string }
 *               rating: { type: number, example: 5 }
 *               comment: { type: string }
 *     responses:
 *       201:
 *         description: Відгук створено
 *
 * /api/reviews/{id}:
 *   delete:
 *     summary: Видалити відгук (адмін або автор)
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Видалено
 */

// 🧾 Публічний доступ — перегляд усіх відгуків
router.get("/", getReviews);

// ✍️ Авторизований користувач може залишити відгук
router.post("/", verifyToken, createReview);

// ❌ Адмін або автор може видалити відгук
router.delete("/:id", verifyToken, isAdminOrAuthor, deleteReview);

export default router;
