// backend/src/routes/products.js
import express from "express";
import Product from "../models/product.js";
import { authMiddleware, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// list with optional search & pagination
router.get("/", async (req, res) => {
  const q = req.query.q;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 20);
  const filter = q ? { $text: { $search: q } } : {};
  const docs = await Product.find(filter).skip((page-1)*limit).limit(limit).populate("category").exec();
  res.json(docs);
});

router.get("/:id", async (req, res) => {
  const doc = await Product.findById(req.params.id).populate("category").exec();
  if (!doc) return res.status(404).json({ message: "Product not found" });
  res.json(doc);
});

// create (admin)
router.post("/", authMiddleware, adminOnly, async (req, res) => {
  const data = req.body;
  const p = await Product.create(data);
  res.status(201).json(p);
});

// update (admin)
router.put("/:id", authMiddleware, adminOnly, async (req, res) => {
  const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true }).exec();
  if (!p) return res.status(404).json({ message: "Not found" });
  res.json(p);
});

// delete (admin)
router.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id).exec();
  res.json({ ok: true });
});

export default router;
