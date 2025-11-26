import express from "express";
import {
  getUserOrders,
  createOrder,
  updateOrderStatus,
  getAllOrders, // optional admin view
} from "../controllers/orderController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Оформлення та керування замовленнями
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Отримати замовлення поточного користувача (або всі для адміна)
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Список замовлень
 *   post:
 *     summary: Створити нове замовлення
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product: { type: string }
 *                     quantity: { type: integer }
 *               address: { type: string }
 *               paymentMethod: { type: string, example: "card" }
 *     responses:
 *       201:
 *         description: Замовлення створено
 *
 * /api/orders/{id}:
 *   put:
 *     summary: Оновити статус замовлення (наприклад admin змінює на shipped)
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, example: "shipped" }
 *     responses:
 *       200:
 *         description: Оновлено
 */

router.get("/", verifyToken, async (req, res, next) => {
  try {
    // if admin requested, return all orders; otherwise orders for user
    if (req.user?.role === "admin") {
      return getAllOrders(req, res, next);
    }
    return getOrdersForUser(req, res, next);
  } catch (err) {
    next(err);
  }
});

router.post("/", verifyToken, createOrder);
router.put("/:id", verifyToken, updateOrderStatus);

export default router;
