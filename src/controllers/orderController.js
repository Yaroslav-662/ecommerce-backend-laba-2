// src/controllers/orderController.js
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { validateObjectId } from "../utils/validateObjectId.js";

// 🛒 Створити нове замовлення
export const createOrder = async (req, res, next) => {
  try {
    const { items, totalPrice } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order must contain at least one item" });
    }

    const order = await Order.create({
      user: req.user.id,
      items,
      totalPrice,
      status: "pending",
    });

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

// 👤 Отримати всі замовлення користувача
export const getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate("items.product");
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// 🔒 Отримати всі замовлення (для адміна)
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "name price");

    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// ⚙️ Оновити статус замовлення (admin або власник)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!validateObjectId(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Перевірка, чи користувач — власник або адмін
    if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    order.status = status || order.status;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (error) {
    next(error);
  }
};
