import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

/**
 * ================================
 * 🔹 ПРОФІЛЬ КОРИСТУВАЧА
 * ================================
 */

// ✅ Отримати свій профіль
export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};

// ✅ Оновити профіль (ім’я, email, пароль, аватар)
export const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;

  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
  }

  if (req.file) user.avatar = `/uploads/${req.file.filename}`;

  await user.save();
  res.json({ message: "✅ Profile updated successfully", user });
};

// ✅ Деактивувати (заморозити) акаунт
export const deactivateAccount = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.isActive = false;
  await user.save();
  res.json({ message: "🚫 Account deactivated" });
};

/**
 * ================================
 * 🔹 ПІДТВЕРДЖЕННЯ EMAIL
 * ================================
 */

// ✅ Надіслати email для підтвердження
export const sendVerificationEmail = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.isVerified) return res.json({ message: "Email already verified" });

  const verifyToken = crypto.randomBytes(32).toString("hex");
  user.verifyToken = verifyToken;
  user.verifyExpires = Date.now() + 3600000;
  await user.save();

  const verifyLink = `${process.env.FRONTEND_URL}/verify/${verifyToken}`;
  await sendEmail({
    to: user.email,
    subject: "🔐 Email Verification",
    html: `<p>Будь ласка, підтвердіть свою електронну пошту:</p>
           <a href="${verifyLink}">${verifyLink}</a>`,
  });

  res.json({ message: "✅ Verification email sent" });
};

// ✅ Підтвердити email через токен
export const verifyEmail = async (req, res) => {
  const user = await User.findOne({
    verifyToken: req.params.token,
    verifyExpires: { $gt: Date.now() },
  });
  if (!user) return res.status(400).json({ message: "Invalid or expired token" });

  user.isVerified = true;
  user.verifyToken = undefined;
  user.verifyExpires = undefined;
  await user.save();
  res.json({ message: "✅ Email verified successfully" });
};

/**
 * ================================
 * 🔹 ВІДНОВЛЕННЯ ТА ЗМІНА ПАРОЛЮ
 * ================================
 */

// ✅ Зміна пароля (через старий)
export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) return res.status(400).json({ message: "Incorrect old password" });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();
  res.json({ message: "🔑 Password updated successfully" });
};

// ✅ Запит на скидання паролю
export const forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.json({ message: "If user exists, email sent" });

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();

  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: "🔁 Password Reset Request",
    html: `<p>Скинути пароль можна за посиланням:</p>
           <a href="${resetLink}">${resetLink}</a>`,
  });

  res.json({ message: "✅ Password reset email sent" });
};

// ✅ Скидання паролю через токен
export const resetPassword = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) return res.status(400).json({ message: "Invalid or expired token" });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(req.body.password, salt);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: "✅ Password reset successfully" });
};

/**
 * ================================
 * 🔹 АДМІНСЬКІ ФУНКЦІЇ
 * ================================
 */

// ✅ Отримати всіх користувачів (з пошуком, пагінацією, фільтром)
export const getAllUsers = async (req, res) => {
  const { search, page = 1, limit = 10, role, sort = "createdAt" } = req.query;

  const query = {
    ...(search && {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    }),
    ...(role && { role }),
  };

  const users = await User.find(query)
    .select("-password")
    .sort({ [sort]: 1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await User.countDocuments(query);

  res.json({
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
    users,
  });
};

// ✅ Отримати користувача за ID
export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};

// ✅ Видалити користувача
export const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  await user.deleteOne();
  res.json({ message: "🗑️ User deleted successfully" });
};

// ✅ Змінити роль користувача (наприклад, зробити адміном)
export const changeUserRole = async (req, res) => {
  const { role } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.role = role || "user";
  await user.save();
  res.json({ message: "👑 Role updated successfully", user });
};
