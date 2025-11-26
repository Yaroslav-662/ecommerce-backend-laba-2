import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  deactivateAccount,
  sendVerificationEmail,
  verifyEmail,
  changePassword,
  forgotPassword,
  resetPassword,
  getAllUsers,
  getUserById,
  deleteUser,
  changeUserRole
} from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";
import uploadMiddleware from "../middleware/uploadMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Керування користувачами
 */

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Отримати дані поточного користувача
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Інформація про користувача
 *   put:
 *     summary: Оновити власний профіль
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Профіль оновлено
 *
 * /api/users/me/deactivate:
 *   put:
 *     summary: Деактивувати власний акаунт
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Акаунт деактивовано
 *
 * /api/users/verify/send:
 *   post:
 *     summary: Надіслати лист підтвердження email
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Лист відправлено
 *
 * /api/users/verify/{token}:
 *   get:
 *     summary: Підтвердити email через токен
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email підтверджено
 *
 * /api/users/me/password:
 *   put:
 *     summary: Змінити пароль (через старий)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200:
 *         description: Пароль змінено
 *
 * /api/users/forgot:
 *   post:
 *     summary: Запит на скидання паролю
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *     responses:
 *       200:
 *         description: Лист для скидання пароля відправлено
 *
 * /api/users/reset/{token}:
 *   post:
 *     summary: Скидання паролю через токен
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Пароль скинуто успішно
 *
 * /api/users:
 *   get:
 *     summary: Отримати список користувачів (пошук, пагінація, роль)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: search
 *         in: query
 *         schema: { type: string }
 *       - name: role
 *         in: query
 *         schema: { type: string }
 *       - name: page
 *         in: query
 *         schema: { type: integer }
 *       - name: limit
 *         in: query
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Список користувачів
 *
 * /api/users/{id}:
 *   get:
 *     summary: Отримати користувача за ID
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *   delete:
 *     summary: Видалити користувача
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *
 * /api/users/{id}/role:
 *   put:
 *     summary: Змінити роль користувача (адмін)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       200:
 *         description: Роль змінено
 */

// ====== Роутинг користувача ======
router.get("/me", verifyToken, getUserProfile);
router.put("/me", verifyToken, uploadMiddleware.single("file"), updateUserProfile);
router.put("/me/deactivate", verifyToken, deactivateAccount);

router.post("/verify/send", verifyToken, sendVerificationEmail);
router.get("/verify/:token", verifyEmail);

router.put("/me/password", verifyToken, changePassword);
router.post("/forgot", forgotPassword);
router.post("/reset/:token", resetPassword);

// ====== Адмінські ======
router.get("/", verifyToken, isAdmin, getAllUsers);
router.get("/:id", verifyToken, isAdmin, getUserById);
router.delete("/:id", verifyToken, isAdmin, deleteUser);
router.put("/:id/role", verifyToken, isAdmin, changeUserRole);

export default router;
