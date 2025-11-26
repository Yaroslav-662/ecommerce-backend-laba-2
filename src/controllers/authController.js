import User from "../models/User.js";
import Token from "../models/Token.js";
import { hashPassword, comparePasswords } from "../utils/passwordUtils.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import dotenv from "dotenv";

dotenv.config();

/* =========================================================
 🧩  AUTH CONTROLLER — МАКСИМАЛЬНА ВЕРСІЯ
========================================================= */

// 🟢 РЕЄСТРАЦІЯ + email підтвердження
export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "Усі поля обов'язкові" });

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: "Email вже існує" });

  const hashed = await hashPassword(password);
  const user = await User.create({ name, email, password: hashed, isVerified: false });

  // Створюємо токен підтвердження email
  const verifyToken = crypto.randomBytes(32).toString("hex");
  const verifyLink = `${process.env.FRONTEND_URL}/verify-email/${verifyToken}`;

  user.resetPasswordToken = verifyToken;
  await user.save();

  await sendEmail({
    to: email,
    subject: "Підтвердження електронної пошти",
    html: `<p>Підтвердьте ваш акаунт: <a href="${verifyLink}">${verifyLink}</a></p>`,
  });

  res.status(201).json({ message: "Користувач зареєстрований. Перевірте пошту." });
};

// ✉️ ПІДТВЕРДЖЕННЯ EMAIL
export const verifyEmail = async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({ resetPasswordToken: token });
  if (!user) return res.status(400).json({ message: "Недійсний токен" });

  user.resetPasswordToken = undefined;
  user.isVerified = true;
  await user.save();

  res.json({ message: "Email успішно підтверджено!" });
};

// 🔑 ЛОГІН + підтримка 2FA
export const login = async (req, res) => {
  const { email, password, twoFactorCode } = req.body;

  const user = await User.findOne({ email });
  if (!user || !user.password)
    return res.status(401).json({ message: "Невірний email або пароль" });

  if (!user.isVerified)
    return res.status(403).json({ message: "Підтвердіть email перед входом" });

  const valid = await comparePasswords(password, user.password);
  if (!valid) return res.status(401).json({ message: "Невірний email або пароль" });

  if (user.twoFactor?.enabled) {
    if (!twoFactorCode) return res.status(401).json({ message: "Потрібен код 2FA" });
    const verified = speakeasy.totp.verify({
      secret: user.twoFactor.secret,
      encoding: "base32",
      token: twoFactorCode,
      window: 1,
    });
    if (!verified) return res.status(401).json({ message: "Невірний 2FA код" });
  }

  const access = generateAccessToken(user);
  const refresh = generateRefreshToken(user);

  await Token.create({
    user: user._id,
    token: refresh,
    userAgent: req.headers["user-agent"] || "Unknown",
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 86400000),
  });

  if (!user.loginHistory) user.loginHistory = [];
  user.loginHistory.push({
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    date: new Date(),
  });
  if (user.loginHistory.length > 10) user.loginHistory.shift();
  await user.save();

  res.json({
    message: "Вхід успішний",
    access,
    refresh,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

// 🔁 REFRESH TOKEN
export const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(400).json({ message: "Refresh токен відсутній" });

  const stored = await Token.findOne({ token: refreshToken });
  if (!stored) return res.status(401).json({ message: "Недійсний refresh токен" });

  try {
    const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: "Користувача не знайдено" });

    const newAccess = generateAccessToken(user);
    const newRefresh = generateRefreshToken(user);

    stored.token = newRefresh;
    stored.expiresAt = new Date(Date.now() + 7 * 86400000);
    await stored.save();

    res.json({ access: newAccess, refresh: newRefresh });
  } catch {
    res.status(401).json({ message: "Недійсний токен" });
  }
};

// 🚪 ВИХІД з поточної сесії
export const logout = async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) await Token.deleteOne({ token: refreshToken });
  res.json({ message: "Вихід успішний" });
};

// 🚪 ВИХІД З УСІХ СЕСІЙ
export const logoutAll = async (req, res) => {
  await Token.deleteMany({ user: req.user.id });
  res.json({ message: "Усі сесії завершено" });
};

// 📋 СЕСІЇ
export const getSessions = async (req, res) => {
  const sessions = await Token.find({ user: req.user.id }).select("userAgent createdAt");
  res.json({ sessions });
};

// ❌ ВИДАЛИТИ КОНКРЕТНУ СЕСІЮ
export const revokeSession = async (req, res) => {
  const { token } = req.body;
  await Token.deleteOne({ token });
  res.json({ message: "Сесію видалено" });
};

// 🔐 2FA — створення
export const setup2FA = async (req, res) => {
  const user = await User.findById(req.user.id);
  const secret = speakeasy.generateSecret({
    name: `Ecommerce (${user.email})`,
    length: 20,
  });
  user.twoFactor.secret = secret.base32;
  await user.save();
  const qr = await qrcode.toDataURL(secret.otpauth_url);
  res.json({ message: "2FA створено", qr, secret: secret.base32 });
};

// 🔍 2FA — перевірка
export const verify2FA = async (req, res) => {
  const { token } = req.body;
  const user = await User.findById(req.user.id);
  const verified = speakeasy.totp.verify({
    secret: user.twoFactor.secret,
    encoding: "base32",
    token,
    window: 1,
  });
  if (!verified) return res.status(400).json({ message: "Невірний код" });
  user.twoFactor.enabled = true;
  await user.save();
  res.json({ message: "2FA активовано" });
};

// ✉️ ЗАБУЛИ ПАРОЛЬ
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.json({ message: "Якщо користувач існує — лист надіслано" });

  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();

  const url = `${process.env.FRONTEND_URL}/reset/${token}`;
  await sendEmail({
    to: email,
    subject: "Скидання паролю",
    html: `<p>Скиньте пароль за посиланням: <a href="${url}">${url}</a></p>`,
  });

  res.json({ message: "Якщо користувач існує — лист надіслано" });
};

// 🔁 СКИДАННЯ ПАРОЛЮ
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) return res.status(400).json({ message: "Недійсний або прострочений токен" });

  user.password = await hashPassword(password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: "Пароль успішно змінено" });
};

// 👁️ ПРОФІЛЬ
export const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password -twoFactor.secret");
  res.json(user);
};

// 🧠 ІСТОРІЯ ВХОДІВ
export const getLoginHistory = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user.loginHistory || []);
};
