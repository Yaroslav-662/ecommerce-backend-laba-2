import Product from "../models/Product.js";
import { validateObjectId } from "../utils/validateObjectId.js";

// 🧩 Отримати всі продукти
export const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find().populate("category", "name");
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

// 🧩 Отримати продукт за ID
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(id).populate("category", "name");
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

// 🧩 Створити новий продукт (лише адмін)
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category } = req.body;
    const newProduct = await Product.create({ name, description, price, category });
    res.status(201).json(newProduct);
  } catch (error) {
    next(error);
  }
};

// 🧩 Оновити продукт
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await Product.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

// 🧩 Видалити продукт
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
};
