const jwt = require("jsonwebtoken");

/**
 * Middleware xác thực JWT Token
 * Lấy token từ header "Authorization: Bearer <token>"
 * Gắn req.user = { id, role } nếu token hợp lệ
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Không tìm thấy token xác thực." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, iat, exp }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn." });
  }
};

/**
 * Middleware kiểm tra quyền Admin
 * Phải chạy sau verifyToken
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Bạn không có quyền truy cập." });
  }
};

module.exports = { verifyToken, isAdmin };
