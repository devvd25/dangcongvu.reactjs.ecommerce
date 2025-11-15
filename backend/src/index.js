// backend/src/index.js
import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { connectDB } from "./db.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import categoryRoutes from "./routes/categories.js";
import cartRoutes from "./routes/carts.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// serve uploads
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

// api
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/carts", cartRoutes);

const port = process.env.PORT || 5000;
(async () => {
  await connectDB(process.env.MONGODB_URI);
  app.listen(port, () => console.log(`Server running at ${process.env.BASE_URL ?? `http://localhost:${port}`}`));
})();
