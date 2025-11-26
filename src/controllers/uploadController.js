// src/controllers/uploadController.js
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadRoot = path.resolve(__dirname, "../../uploads");

/**
 * ✅ Завантаження файлу
 */
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Файл не завантажено" });

    const filePath = `/uploads/${req.file.filename}`;
    res.status(200).json({
      message: "✅ Файл успішно завантажено",
      filePath,
      fileName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
    });
  } catch (error) {
    console.error("❌ Помилка при завантаженні файлу:", error);
    res.status(500).json({ message: "Помилка сервера при завантаженні файлу" });
  }
};

/**
 * 📜 Отримати список усіх файлів
 */
export const getAllFiles = async (req, res) => {
  try {
    const files = fs.readdirSync(uploadRoot).map((name) => {
      const stats = fs.statSync(path.join(uploadRoot, name));
      return {
        name,
        size: stats.size,
        createdAt: stats.birthtime,
        url: `/uploads/${name}`,
      };
    });

    res.status(200).json(files);
  } catch (error) {
    console.error("❌ Помилка при читанні файлів:", error);
    res.status(500).json({ message: "Не вдалося отримати список файлів" });
  }
};

/**
 * 🗑️ Видалити файл за назвою
 */
export const deleteFile = async (req, res) => {
  try {
    const { name } = req.params;
    const filePath = path.join(uploadRoot, name);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Файл не знайдено" });
    }

    fs.unlinkSync(filePath);
    res.status(200).json({ message: "🗑️ Файл видалено" });
  } catch (error) {
    console.error("❌ Помилка при видаленні файлу:", error);
    res.status(500).json({ message: "Не вдалося видалити файл" });
  }
};

/**
 * 🔁 Перейменування або оновлення файлу
 */
export const renameFile = async (req, res) => {
  try {
    const { oldName, newName } = req.body;
    if (!oldName || !newName)
      return res.status(400).json({ message: "Вкажіть oldName і newName" });

    const oldPath = path.join(uploadRoot, oldName);
    const newPath = path.join(uploadRoot, newName);

    if (!fs.existsSync(oldPath))
      return res.status(404).json({ message: "Файл не знайдено" });

    fs.renameSync(oldPath, newPath);
    res.status(200).json({ message: "✅ Файл перейменовано", newName });
  } catch (error) {
    console.error("❌ Помилка при перейменуванні файлу:", error);
    res.status(500).json({ message: "Не вдалося перейменувати файл" });
  }
};
