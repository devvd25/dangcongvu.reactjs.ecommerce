// backend/src/scripts/migrate.js
import fs from "fs/promises";
import path from "path";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// models
import User from "../models/user.js";
import Category from "../models/category.js";
import Product from "../models/product.js";
import Cart from "../models/cart.js";

// db.json nằm ở ROOT project
const dbPath = path.resolve(__dirname, "../../../db.json");

function normalizeImages(rawImages) {
  if (!rawImages) return [];
  if (typeof rawImages === "string") {
    const s = rawImages.trim();
    if ((s.startsWith("[") || s.startsWith("{"))) {
      try {
        const parsed = JSON.parse(s);
        rawImages = parsed;
      } catch (e) {
        return [s];
      }
    } else {
      return [s];
    }
  }

  if (Array.isArray(rawImages)) {
    const out = rawImages
      .map(item => {
        if (!item) return null;
        if (typeof item === "string") return item;
        if (typeof item === "object") {
          return item.url ?? item.src ?? item.path ?? item.image ?? null;
        }
        return null;
      })
      .filter(Boolean);
    return out;
  }

  return [];
}

function normalizePrice(p) {
  if (p === undefined || p === null) return null;
  if (typeof p === "number" && !Number.isNaN(p)) return p;
  if (typeof p === "string") {
    const cleaned = p.replace(/[^0-9.,-]/g, "").trim();
    const normalized = cleaned.replace(/,/g, ".");
    const n = Number(normalized);
    if (!Number.isNaN(n)) return n;
  }
  return null;
}

function pickPriceFromProduct(prod) {
  // ưu tiên các trường thường gặp trong db.json của bạn
  const candidates = [
    prod.salePrice,
    prod.discountPrice,
    prod.costPrice,
    prod.price,
    prod.cost,
    prod.gia,
    prod.price_text
  ];

  for (const val of candidates) {
    const parsed = normalizePrice(val);
    if (parsed !== null) return parsed;
  }
  return null;
}

async function main() {
  console.log("Reading DB from:", dbPath);

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("ERROR: MONGODB_URI is not set. Create backend/.env with MONGODB_URI and restart.");
    process.exit(1);
  }

  await mongoose.connect(uri, {});
  console.log("Connected to MongoDB");

  const raw = await fs.readFile(dbPath, "utf8");
  const data = JSON.parse(raw);

  // CATEGORY
  const catMap = new Map();
  if (Array.isArray(data.categories)) {
    for (const c of data.categories) {
      const doc = await Category.create({
        name: c.name ?? c.title ?? "Unnamed",
        slug: c.slug ?? "",
        description: c.description ?? ""
      });
      catMap.set(String(c.id ?? c._id), doc._id);
    }
    console.log("Categories imported:", catMap.size);
  } else {
    console.log("No categories array found in db.json");
  }

  // PRODUCT - robust import
  const prodMap = new Map();
  if (Array.isArray(data.products)) {
    for (const p of data.products) {
      try {
        const oldCatId = p.categoryId ?? p.category_id ?? p.category ?? null;
        const newCatId = oldCatId ? catMap.get(String(oldCatId)) : null;

        const images = normalizeImages(p.images ?? p.image ?? p.imagesArr ?? []);
        let price = pickPriceFromProduct(p);
        if (price === null) {
          console.warn(`Warning: product (old id ${p.id ?? p._id ?? "?"}) missing/parsing price — using 0 as fallback.`);
          price = 0;
        }

        const stock = Number(p.stock ?? p.quantity ?? p.qty ?? 0) || 0;

        const productDoc = await Product.create({
          name: p.name ?? p.title ?? "No name",
          description: p.description ?? p.detail ?? p.specification ?? "",
          price,
          stock,
          category: newCatId || undefined,
          images,
          specification: p.specification ?? {},
          // giữ nguyên các trường gốc nếu bạn muốn truy xuất sau này
          salePrice: normalizePrice(p.salePrice) ?? undefined,
          discountPrice: normalizePrice(p.discountPrice) ?? undefined,
          costPrice: normalizePrice(p.costPrice) ?? undefined
        });

        prodMap.set(String(p.id ?? p._id), productDoc._id);
      } catch (err) {
        console.error("Error importing product (skipping). Old id:", p.id ?? p._id ?? "?", "error:", err.message || err);
      }
    }
    console.log("Products imported:", prodMap.size);
  } else {
    console.log("No products array found in db.json");
  }

  // USER
    // USER (upsert / reuse existing users)
  const userMap = new Map();
  if (Array.isArray(data.users)) {
    for (const u of data.users) {
      try {
        const email = (u.email ?? "").toString().toLowerCase();

        // tìm user đã có bằng email
        let existing = null;
        if (email) {
          existing = await User.findOne({ email }).exec();
        }

        if (existing) {
          // đã có, dùng _id hiện có
          userMap.set(String(u.id ?? u._id), existing._id);
        } else {
          // không có → tạo mới (hash password)
          const hash = await bcrypt.hash(String(u.password ?? "changeme"), 10);
          const doc = await User.create({
            username: u.username ?? u.name ?? undefined,
            email: email || `user${Math.random().toString(36).slice(2)}@example.com`,
            password: hash,
            role: u.role ?? "user",
            phone: u.phone
          });
          userMap.set(String(u.id ?? u._id), doc._id);
        }
      } catch (err) {
        // nếu lỗi duplicate do race hoặc index lạ, cố gắng lấy document hiện có và map nó
        console.error("Error importing user (attempt to recover). Old id:", u.id ?? u._id ?? "?", "error:", err.message || err);
        try {
          const email = (u.email ?? "").toString().toLowerCase();
          if (email) {
            const existing2 = await User.findOne({ email }).exec();
            if (existing2) {
              userMap.set(String(u.id ?? u._1d), existing2._id);
            }
          }
        } catch (e2) {
          // ignore
        }
      }
    }
    console.log("Users imported / mapped:", userMap.size);
  }


  // CART
  if (Array.isArray(data.carts)) {
    for (const c of data.carts) {
      try {
        const newUserId = userMap.get(String(c.userId ?? c.user_id ?? c.user));
        if (!newUserId) {
          console.warn("Skipping cart import — user not found for cart old id:", c.id ?? c._id ?? "?");
          continue;
        }
        const items = (c.items ?? []).map(it => ({
          product: prodMap.get(String(it.productId ?? it.product)),
          quantity: Number(it.quantity ?? it.qty ?? 1)
        })).filter(it => it.product);
        await Cart.create({ user: newUserId, items });
      } catch (err) {
        console.error("Error importing cart (skipping). Old id:", c.id ?? c._id ?? "?", "error:", err.message || err);
      }
    }
    console.log("Carts imported");
  }

  console.log("Migration finished!");
  process.exit(0);
}

main().catch(err => {
  console.error("Uncaught migration error:", err);
  process.exit(1);
});
