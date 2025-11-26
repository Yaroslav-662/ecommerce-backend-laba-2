// src/routes/uploadRoutes.js
import express from "express";
import uploadMiddleware from "../middleware/uploadMiddleware.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import {
  uploadFile,
  getAllFiles,
  deleteFile,
  renameFile,
} from "../controllers/uploadController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Uploads
 *   description: Завантаження файлів (зображення товарів, аватари)
 */

/**
 * @swagger
 * /api/upload/file:
 *   post:
 *     summary: Завантажити файл (авторизований користувач)
 *     tags: [Uploads]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Файл завантажено
 */
router.post("/file", verifyToken, uploadMiddleware.single("file"), uploadFile);

/**
 * @swagger
 * /api/upload:
 *   get:
 *     summary: Отримати список усіх завантажених файлів (адмін)
 *     tags: [Uploads]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Список файлів
 */
router.get("/", verifyToken, isAdmin, getAllFiles);

/**
 * @swagger
 * /api/upload/{name}:
 *   delete:
 *     summary: Видалити файл (адмін)
 *     tags: [Uploads]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: name
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Файл видалено
 */
router.delete("/:name", verifyToken, isAdmin, deleteFile);

/**
 * @swagger
 * /api/upload/rename:
 *   put:
 *     summary: Перейменувати файл
 *     tags: [Uploads]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldName: { type: string }
 *               newName: { type: string }
 *     responses:
 *       200:
 *         description: Файл перейменовано
 */
router.put("/rename", verifyToken, isAdmin, renameFile);

export default router;
