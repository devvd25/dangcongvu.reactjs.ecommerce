// backend/src/scripts/copy_images_and_update_db.js
import fs from "fs/promises";
import fsc from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/product.js";
import { fileURLToPath } from "url";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// FRONTEND ASSETS (CHUẨN VỚI DỰ ÁN CỦA BẠN)
const frontendAssetsDir = path.resolve(__dirname, "../../../frontend/src/assets/Products");

// FOLDER UPLOADS TRONG BACKEND
const uploadsDir = path.resolve(process.cwd(), "public", "uploads");

const baseUrl = process.env.BASE_URL ?? `http://localhost:${process.env.PORT || 5000}`;

async function ensureDir(dir) {
  if (!fsc.existsSync(dir)) await fs.mkdir(dir, { recursive: true });
}

async function copyFileSafe(src, dest) {
  await ensureDir(path.dirname(dest));
  try {
    await fs.copyFile(src, dest);
    return true;
  } catch (_) {
    return false;
  }
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI missing");
    process.exit(1);
  }
  await mongoose.connect(uri, {});

  console.log("📁 Source images:", frontendAssetsDir);
  console.log("📁 Uploads folder:", uploadsDir);

  await ensureDir(uploadsDir);

  const products = await Product.find({}).exec();
  let updated = 0;

  for (const p of products) {
    const oldImages = p.images ?? [];
    const newImages = [];

    for (const img of oldImages) {
      if (!img) continue;

      // ảnh dạng /src/assets/Products/...
      const cleanPath = img.replace(/^\//, ""); // bỏ /
      const relative = cleanPath.replace("src/assets/Products", "");

      // lấy tên file cuối
      const filename = path.basename(cleanPath);

      // thử lấy ảnh từ frontend/src/assets/Products
      const srcCandidate = path.join(frontendAssetsDir, relative);
      const fallbackSrc = path.join(frontendAssetsDir, filename);

      let finalSrc = null;
      if (fsc.existsSync(srcCandidate)) finalSrc = srcCandidate;
      else if (fsc.existsSync(fallbackSrc)) finalSrc = fallbackSrc;

      if (!finalSrc) {
        console.warn("⚠️ Không tìm thấy ảnh:", img, "=> thử:", fallbackSrc);
        continue;
      }

      const categoryFolder = p.category ? String(p.category) : "general";
      const destRel = path.join(categoryFolder, filename);
      const destPath = path.join(uploadsDir, destRel);

      const ok = await copyFileSafe(finalSrc, destPath);

      if (ok)
        newImages.push(`${baseUrl}/uploads/${destRel.replace(/\\/g, "/")}`);
      else
        console.warn("⚠️ Lỗi copy ảnh:", finalSrc);
    }

    if (newImages.length) {
      p.images = newImages;
      await p.save();
      updated++;
    }
  }

  console.log("🎉 Updated products with new image URLs:", updated);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
