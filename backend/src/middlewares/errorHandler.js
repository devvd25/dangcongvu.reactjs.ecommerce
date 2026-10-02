/**
 * Global Error Handler Middleware
 * Bắt tất cả lỗi từ controllers và trả về response thống nhất
 */
const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err.message);
  console.error(err.stack);

  // Sequelize Validation Error
  if (err.name === "SequelizeValidationError") {
    const messages = err.errors.map((e) => e.message);
    return res.status(400).json({
      message: "Dữ liệu không hợp lệ.",
      errors: messages,
    });
  }

  // Sequelize Unique Constraint Error
  if (err.name === "SequelizeUniqueConstraintError") {
    const fields = err.errors.map((e) => e.path);
    return res.status(409).json({
      message: `Giá trị đã tồn tại: ${fields.join(", ")}`,
    });
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ message: "Token không hợp lệ." });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Token đã hết hạn." });
  }

  // Default Error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || "Đã có lỗi xảy ra trên server.",
  });
};

module.exports = errorHandler;
