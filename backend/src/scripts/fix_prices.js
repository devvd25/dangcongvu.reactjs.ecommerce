// backend/src/scripts/fix_prices.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/product.js";
dotenv.config();

function normalizePrice(p){
  if (p === undefined || p === null) return null;
  if (typeof p === "number" && !Number.isNaN(p)) return p;
  if (typeof p === "string") {
    const cleaned = p.replace(/[^0-9.,-]/g,"").trim();
    const normalized = cleaned.replace(/,/g,".");
    const n = Number(normalized);
    if (!Number.isNaN(n)) return n;
  }
  return null;
}

async function main(){
  const uri = process.env.MONGODB_URI;
  if(!uri){ console.error("MONGODB_URI missing"); process.exit(1); }
  await mongoose.connect(uri);

  const cursor = Product.find({ $or:[ { price:0 }, { price: { $exists:false } } ] }).cursor();
  let updated = 0;
  for await (const p of cursor){
    const candidates = [p.salePrice, p.discountPrice, p.costPrice, p.price];
    let newPrice = null;
    for (const c of candidates) {
      const np = normalizePrice(c);
      if (np !== null) { newPrice = np; break; }
    }
    if (newPrice !== null && newPrice !== p.price) {
      p.price = newPrice;
      await p.save();
      updated++;
    }
  }
  console.log("Prices updated:", updated);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(e=>{ console.error(e); process.exit(1); });
