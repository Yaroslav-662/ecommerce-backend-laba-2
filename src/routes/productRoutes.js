import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Операції з товарами
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Отримати список товарів
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *         description: Номер сторінки (пагінація)
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Пошуковий запит (назва/опис)
 *     responses:
 *       200:
 *         description: Список товарів
 *   post:
 *     summary: Додати новий товар
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: "Матова помада Velvet Touch" }
 *               price: { type: number, example: 349 }
 *               category: { type: string, example: "категорія_id" }
 *               description: { type: string, example: "Опис товару" }
 *               stock: { type: number, example: 100 }
 *     responses:
 *       201:
 *         description: Товар додано
 *
 * /api/products/{id}:
 *   get:
 *     summary: Отримати товар за ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Товар }
 *   put:
 *     summary: Оновити товар
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200: { description: Оновлено }
 *   delete:
 *     summary: Видалити товар
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200: { description: Видалено }
 */

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", verifyToken, isAdmin, createProduct);
router.put("/:id", verifyToken, isAdmin, updateProduct);
router.delete("/:id", verifyToken, isAdmin, deleteProduct);

export default router;
