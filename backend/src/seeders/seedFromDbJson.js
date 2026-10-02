const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const {
  sequelize,
  User,
  Category,
  Product,
  ProductImage,
  Cart,
  CartItem,
  Order,
  OrderItem,
  FeaturedProduct,
} = require("../models");

/**
 * Tạo database nếu chưa tồn tại
 */
async function ensureDatabaseExists() {
  const dbName = process.env.DB_NAME || "ecommerce_db";
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  });

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
  );
  await connection.end();
  console.log(`✅ Đã kiểm tra/tạo database "${dbName}".`);
}

async function seed() {
  try {
    console.log("🌱 Bắt đầu quá trình seed dữ liệu từ db.json...");

    if (sequelize.getDialect() !== "sqlite" && !process.env.DATABASE_URL) {
      await ensureDatabaseExists();
    }
    await sequelize.authenticate();
    console.log(`✅ Kết nối cơ sở dữ liệu (${sequelize.getDialect()}) thành công.`);

    // Xóa và tạo mới toàn bộ bảng nếu cần
    await sequelize.sync();
    console.log("✅ Đã đồng bộ các bảng trong database.");

    // Đọc db.json
    const localDataPath = path.resolve(__dirname, "../data/db.json");
    const rootDataPath = path.resolve(__dirname, "../../../db.json");
    const dbJsonPath = fs.existsSync(localDataPath) ? localDataPath : rootDataPath;
    if (!fs.existsSync(dbJsonPath)) {
      throw new Error(`Không tìm thấy file db.json tại: ${dbJsonPath}`);
    }
    const rawData = fs.readFileSync(dbJsonPath, "utf-8");
    const dbData = JSON.parse(rawData);

    // ==========================================
    // 1. Seed Categories
    // ==========================================
    console.log("\n📦 Đang import Danh mục (Categories)...");
    const categoryIdMap = {}; // oldId -> newId
    if (Array.isArray(dbData.categories)) {
      for (const cat of dbData.categories) {
        const createdCat = await Category.create({
          id: parseInt(cat.id, 10) || undefined,
          name: cat.name,
          slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, "-"),
          image: cat.image || "",
          status: cat.status !== false,
        });
        categoryIdMap[cat.id] = createdCat.id;
      }
      console.log(`✅ Đã import ${dbData.categories.length} danh mục.`);
    }

    // ==========================================
    // 2. Seed Products & ProductImages
    // ==========================================
    console.log("\n📱 Đang import Sản phẩm (Products & Images)...");
    const productIdMap = {}; // oldId -> newId
    const productPriceMap = {}; // newId -> price
    if (Array.isArray(dbData.products)) {
      for (const p of dbData.products) {
        const targetCategoryId = categoryIdMap[p.categoryId] || parseInt(p.categoryId, 10) || 1;

        const createdProduct = await Product.create({
          category_id: targetCategoryId,
          name: p.name,
          model: p.model || "",
          cost_price: parseFloat(p.costPrice) || 0,
          sale_price: parseFloat(p.salePrice) || 0,
          discount_price: parseFloat(p.discountPrice) || 0,
          description: p.description || "",
          specification: p.specification || null,
          type: p.type || "",
          features: p.features || [],
          promotions: p.promotions || [],
          stock: parseInt(p.stock, 10) || 0,
          rating: parseFloat(p.rating) || 4.5,
        });

        productIdMap[p.id] = createdProduct.id;
        productPriceMap[createdProduct.id] =
          parseFloat(p.discountPrice) || parseFloat(p.salePrice) || 0;

        // Thêm hình ảnh nếu có
        if (Array.isArray(p.images) && p.images.length > 0) {
          const imagesToInsert = p.images.map((img, idx) => ({
            product_id: createdProduct.id,
            url: img.url || "",
            alt: img.alt || p.name,
            sort_order: idx + 1,
          }));
          await ProductImage.bulkCreate(imagesToInsert);
        }
      }
      console.log(`✅ Đã import ${dbData.products.length} sản phẩm kèm hình ảnh.`);
    }

    // ==========================================
    // 3. Seed Users
    // ==========================================
    console.log("\n👤 Đang import Người dùng (Users)...");
    const userIdMap = {}; // oldId -> newId
    const seenEmails = new Set();
    const seenPhones = new Set();

    if (Array.isArray(dbData.users)) {
      for (const u of dbData.users) {
        // Hash password bằng bcryptjs
        const rawPassword = u.password ? String(u.password) : "123456";
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        // Tránh trùng email
        let email = u.email;
        if (seenEmails.has(email)) {
          email = `user_${Date.now()}_${email}`;
        }
        seenEmails.add(email);

        // Tránh trùng số điện thoại
        let phone = u.phone;
        if (seenPhones.has(phone)) {
          // Điều chỉnh số cuối nếu bị trùng (như devvd25 trong db.json trùng def0)
          phone = phone.slice(0, -1) + (seenPhones.size % 10);
        }
        seenPhones.add(phone);

        const createdUser = await User.create({
          username: u.username || "User",
          email,
          password: hashedPassword,
          phone,
          role: u.role === "admin" ? "admin" : "user",
        });

        userIdMap[u.id] = createdUser.id;
      }
      console.log(`✅ Đã import ${dbData.users.length} người dùng (mật khẩu mặc định đã mã hoá bcrypt).`);
    }

    // ==========================================
    // 4. Seed Carts & CartItems
    // ==========================================
    console.log("\n🛒 Đang import Giỏ hàng (Carts & Items)...");
    const createdUserIdsWithCart = new Set();

    if (Array.isArray(dbData.carts)) {
      for (const c of dbData.carts) {
        const mappedUserId = userIdMap[c.userId];
        if (!mappedUserId || createdUserIdsWithCart.has(mappedUserId)) {
          continue;
        }

        const cart = await Cart.create({ user_id: mappedUserId });
        createdUserIdsWithCart.add(mappedUserId);

        if (Array.isArray(c.items) && c.items.length > 0) {
          const itemsToInsert = [];
          for (const item of c.items) {
            const mappedProdId = productIdMap[item.productId];
            if (mappedProdId) {
              itemsToInsert.push({
                cart_id: cart.id,
                product_id: mappedProdId,
                quantity: item.quantity || 1,
              });
            }
          }
          if (itemsToInsert.length > 0) {
            await CartItem.bulkCreate(itemsToInsert);
          }
        }
      }
    }

    // Đảm bảo tất cả users đều có cart
    for (const oldId in userIdMap) {
      const uId = userIdMap[oldId];
      if (!createdUserIdsWithCart.has(uId)) {
        await Cart.create({ user_id: uId });
        createdUserIdsWithCart.add(uId);
      }
    }
    console.log(`✅ Đã đồng bộ ${createdUserIdsWithCart.size} giỏ hàng kèm sản phẩm.`);

    // ==========================================
    // 5. Seed Orders & OrderItems
    // ==========================================
    console.log("\n📋 Đang import Đơn hàng (Orders & Items)...");
    if (Array.isArray(dbData.orders)) {
      let orderCount = 0;
      for (const o of dbData.orders) {
        const mappedUserId = userIdMap[o.userId];
        if (!mappedUserId) continue;

        const order = await Order.create({
          user_id: mappedUserId,
          total_price: parseFloat(o.totalPrice) || 0,
          order_time: o.orderTime ? new Date(o.orderTime) : new Date(),
          recipient_name: o.name || "Khách hàng",
          address: o.address || "Việt Nam",
          phone: o.phone || "0985702931",
          status: "delivered",
        });

        if (Array.isArray(o.items)) {
          const itemsToInsert = [];
          for (const item of o.items) {
            const mappedProdId = productIdMap[item.productId];
            if (mappedProdId) {
              itemsToInsert.push({
                order_id: order.id,
                product_id: mappedProdId,
                quantity: item.quantity || 1,
                price: productPriceMap[mappedProdId] || 0,
              });
            }
          }
          if (itemsToInsert.length > 0) {
            await OrderItem.bulkCreate(itemsToInsert);
          }
        }
        orderCount++;
      }
      console.log(`✅ Đã import ${orderCount} đơn đặt hàng.`);
    }

    // ==========================================
    // 6. Seed Featured Products (FlashSales, HighQuality, Samsung)
    // ==========================================
    console.log("\n⭐ Đang import Sản phẩm nổi bật (Featured Products)...");
    const featuredItems = [];

    const addFeatured = (list, type) => {
      if (Array.isArray(list)) {
        for (const item of list) {
          const mappedProdId = productIdMap[item.productId];
          if (mappedProdId) {
            featuredItems.push({
              product_id: mappedProdId,
              type,
            });
          }
        }
      }
    };

    addFeatured(dbData.flashSales, "flash_sale");
    addFeatured(dbData.highQuality, "high_quality");
    addFeatured(dbData.samsung, "samsung");

    if (featuredItems.length > 0) {
      await FeaturedProduct.bulkCreate(featuredItems);
    }
    console.log(`✅ Đã import ${featuredItems.length} bản ghi sản phẩm nổi bật.`);

    console.log("\n🎉 Quá trình SEED DỮ LIỆU ĐÃ HOÀN TẤT THÀNH CÔNG! 🎉");
    console.log("-------------------------------------------------------");
    console.log("🔑 Tài khoản kiểm thử:");
    console.log("   - Admin: admin@gmail.com | Password: 123456");
    console.log("   - User : user@gmail.com  | Password: 123456");
    console.log("-------------------------------------------------------");
    if (require.main === module) {
      process.exit(0);
    }
    return true;
  } catch (error) {
    console.error("❌ Lỗi trong quá trình seed dữ liệu:", error);
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;
