// src/controllers/categoryController.js

import Category from "../models/Category.js";

// Отримати всі категорії
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (err) {
    next(err);
  }
};

// Отримати категорію за ID
export const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Категорію не знайдено" });
    res.status(200).json(category);
  } catch (err) {
    next(err);
  }
};

// Створити нову категорію
export const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const exists = await Category.findOne({ name });
    if (exists) return res.status(400).json({ message: "Така категорія вже існує" });

    const category = new Category({ name, description });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

// Оновити категорію
export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ message: "Категорію не знайдено" });
    res.status(200).json(category);
  } catch (err) {
    next(err);
  }
};

// Видалити категорію
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: "Категорію не знайдено" });
    res.status(200).json({ message: "Категорію видалено" });
  } catch (err) {
    next(err);
  }
};
