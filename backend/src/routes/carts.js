// backend/src/routes/carts.js
import express from "express";
import Cart from "../models/cart.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// get my cart
router.get("/me", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const cart = await Cart.findOne({ user: userId }).populate("items.product").exec();
  res.json(cart ?? { items: [] });
});

// update cart (replace)
router.put("/me", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const items = req.body.items ?? [];
  const doc = await Cart.findOneAndUpdate(
    { user: userId },
    { items, updatedAt: new Date() },
    { upsert: true, new: true }
  ).exec();
  res.json(doc);
});

export default router;
