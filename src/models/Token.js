import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  expiresAt: Date,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Token", tokenSchema);
