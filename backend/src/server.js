require("dotenv").config();
const mysql = require("mysql2/promise");
const app = require("./app");
const { sequelize } = require("./models");

const PORT = process.env.PORT || 5000;

/**
 * Đảm bảo database tồn tại trước khi Sequelize kết nối
 */
async function ensureDatabaseExists() {
  const dbName = process.env.DB_NAME || "ecommerce_db";
  try {
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
    console.log(`✅ Database "${dbName}" đã sẵn sàng.`);
  } catch (err) {
    console.warn(`⚠️ Không thể tự tạo database: ${err.message}. Sẽ thử kết nối trực tiếp...`);
  }
}

async function startServer() {
  try {
    const dialect = sequelize.getDialect();

    // 1. Kiểm tra / tạo database nếu dùng MySQL
    if (dialect !== "sqlite" && process.env.DB_HOST) {
      await ensureDatabaseExists();
    }

    // 2. Kiểm tra kết nối Sequelize
    await sequelize.authenticate();
    console.log(`✅ Kết nối cơ sở dữ liệu (${dialect}) thành công qua Sequelize.`);

    // 3. Đồng bộ models với database
    await sequelize.sync();
    console.log("✅ Các bảng dữ liệu đã được đồng bộ.");

    // 4. Tự động seed dữ liệu mẫu từ db.json nếu database đang trống
    const { Product } = require("./models");
    const count = await Product.count();
    if (count === 0) {
      console.log("🌱 Cơ sở dữ liệu đang trống. Đang tự động nạp dữ liệu mẫu ban đầu từ db.json...");
      const seed = require("./seeders/seedFromDbJson");
      await seed();
    }

    // 5. Khởi động server
    app.listen(PORT, () => {
      console.log(`🚀 Server Backend đang chạy tại: http://localhost:${PORT}`);
      console.log(`📌 API Health Check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("❌ Không thể khởi động server:", error);
    process.exit(1);
  }
}

startServer();
