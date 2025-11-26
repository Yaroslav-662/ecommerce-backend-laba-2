import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  description: String,
  price: { type: Number, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  images: [String],
  stock: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
productSchema.index({ name: "text", description: "text" });

export default mongoose.model("Product", productSchema);
