// backend/src/models/product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  description: { type: String },
  price: { type: Number, required: true, default: 0 },
  salePrice: Number,
  discountPrice: Number,
  costPrice: Number,
  stock: { type: Number, default: 0 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  images: [String],
  specification: mongoose.Schema.Types.Mixed,
  rating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

productSchema.index({ name: "text", description: "text" });

export default mongoose.model("Product", productSchema);
