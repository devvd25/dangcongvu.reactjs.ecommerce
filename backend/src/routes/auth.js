// backend/src/routes/auth.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user.js";
dotenv.config();

const router = express.Router();

// register
router.post("/register", async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password required" });
  const existing = await User.findOne({ email }).exec();
  if (existing) return res.status(409).json({ message: "Email already used" });
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, password: hash, role: role ?? "user" });
  return res.status(201).json({ id: user._id, email: user.email });
});

// login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password required" });
  const user = await User.findOne({ email }).exec();
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });
  const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user._id, email: user.email, username: user.username, role: user.role } });
});

export default router;
