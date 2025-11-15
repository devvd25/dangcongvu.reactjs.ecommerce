// backend/src/models/category.js
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  slug: String,
  description: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Category", categorySchema);
