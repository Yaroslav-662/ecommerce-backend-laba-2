import express from "express";
import passport from "passport";
import {
  register,
  verifyEmail,
  login,
  refresh,
  logout,
  logoutAll,
  getSessions,
  revokeSession,
  setup2FA,
  verify2FA,
  forgotPassword,
  resetPassword,
  getProfile,
  getLoginHistory,
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import "../config/passport.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Авторизація, токени, 2FA, email, сесії
 */

// 🔑 Реєстрація та підтвердження
router.post("/register", register);
router.get("/verify/:token", verifyEmail);

// 🔐 Вхід / вихід
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/logout/all", verifyToken, logoutAll);

// 🔁 Сесії
router.get("/sessions", verifyToken, getSessions);
router.post("/sessions/revoke", verifyToken, revokeSession);

// ✉️ Відновлення паролю
router.post("/forgot", forgotPassword);
router.post("/reset/:token", resetPassword);

// 👤 Профіль
router.get("/profile", verifyToken, getProfile);
router.get("/logins", verifyToken, getLoginHistory);

// 🔑 2FA
router.post("/2fa/setup", verifyToken, setup2FA);
router.post("/2fa/verify", verifyToken, verify2FA);

// 🌍 OAuth (Google)
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", { session: false }), (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/oauth-success`);
});

export default router;
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: 🔐 Авторизація, реєстрація, 2FA, токени, email підтвердження, відновлення паролю
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Реєстрація нового користувача з відправкою листа підтвердження
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ірина
 *               email:
 *                 type: string
 *                 example: iryna@example.com
 *               password:
 *                 type: string
 *                 example: Pass1234!
 *     responses:
 *       201:
 *         description: Користувача зареєстровано, лист надіслано
 *       409:
 *         description: Email вже існує
 *       400:
 *         description: Некоректні дані
 *
 * /api/auth/verify/{token}:
 *   get:
 *     summary: Підтвердження електронної пошти
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Токен підтвердження email
 *     responses:
 *       200:
 *         description: Email успішно підтверджено
 *       400:
 *         description: Недійсний токен
 *
 * /api/auth/login:
 *   post:
 *     summary: Вхід користувача (підтримка 2FA)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@beautystore.com
 *               password:
 *                 type: string
 *                 example: Admin123!
 *               twoFactorCode:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Успішний вхід
 *       401:
 *         description: Невірні дані або 2FA код
 *
 * /api/auth/refresh:
 *   post:
 *     summary: Оновлення access токена за допомогою refresh токена
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Нові токени згенеровано
 *       401:
 *         description: Недійсний або прострочений токен
 *
 * /api/auth/logout:
 *   post:
 *     summary: Вихід користувача з поточної сесії
 *     tags: [Auth]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOi...
 *     responses:
 *       200:
 *         description: Вихід успішний
 *
 * /api/auth/logout/all:
 *   post:
 *     summary: Вихід з усіх сесій користувача
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Усі сесії завершено
 *
 * /api/auth/sessions:
 *   get:
 *     summary: Отримати список активних сесій користувача
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Список сесій
 *
 * /api/auth/sessions/revoke:
 *   post:
 *     summary: Від Revoke конкретну сесію за токеном
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: eyJhbGciOi...
 *     responses:
 *       200:
 *         description: Сесію видалено
 *
 * /api/auth/forgot:
 *   post:
 *     summary: Запит на скидання паролю
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Якщо користувач існує — лист надіслано
 *
 * /api/auth/reset/{token}:
 *   post:
 *     summary: Скидання паролю через токен
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Токен відновлення паролю
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 example: NewStrongPass123!
 *     responses:
 *       200:
 *         description: Пароль успішно змінено
 *       400:
 *         description: Недійсний токен
 *
 * /api/auth/profile:
 *   get:
 *     summary: Отримати поточний профіль користувача
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Інформація про користувача
 *
 * /api/auth/logins:
 *   get:
 *     summary: Отримати історію входів користувача
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Історія входів
 *
 * /api/auth/2fa/setup:
 *   post:
 *     summary: Налаштування двофакторної аутентифікації (отримання QR-коду)
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Повертає QR-код і секрет
 *
 * /api/auth/2fa/verify:
 *   post:
 *     summary: Підтвердження двофакторної аутентифікації
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: 2FA активовано
 *
 * /api/auth/google:
 *   get:
 *     summary: Вхід через Google (OAuth)
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Редірект до Google
 */
