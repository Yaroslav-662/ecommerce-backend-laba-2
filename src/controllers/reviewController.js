// src/controllers/reviewController.js
import Review from "../models/Review.js";
import Product from "../models/Product.js";
import { validateObjectId } from "../utils/validateObjectId.js";

// 🧾 Отримати всі відгуки
export const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find().populate("user", "name").populate("product", "name");
    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
};

// 🧍‍♀️ Отримати відгуки для конкретного товару
export const getReviewsByProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    validateObjectId(productId);
    const reviews = await Review.find({ product: productId }).populate("user", "name");
    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
};

// ✍️ Створити новий відгук
export const createReview = async (req, res, next) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user.id;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const review = new Review({
      product: productId,
      user: userId,
      rating,
      comment,
    });

    await review.save();

    // Оновлення середнього рейтингу продукту
    const productReviews = await Review.find({ product: productId });
    const avgRating =
      productReviews.reduce((acc, r) => acc + r.rating, 0) / productReviews.length;

    await Product.findByIdAndUpdate(productId, { rating: avgRating.toFixed(1) });

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

// ❌ Видалити відгук (адмін або автор)
export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateObjectId(id);

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (req.user.role !== "admin" && review.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    await review.deleteOne();
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    next(error);
  }
};
