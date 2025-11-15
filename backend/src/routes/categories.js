// backend/src/routes/categories.js
import express from "express";
import Category from "../models/category.js";
import { authMiddleware, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const cats = await Category.find().exec();
  res.json(cats);
});

router.post("/", authMiddleware, adminOnly, async (req, res) => {
  const c = await Category.create(req.body);
  res.status(201).json(c);
});

export default router;
