const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// ==========================================
// Middleware
// ==========================================

// CORS - cho phép frontend gọi API
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? process.env.FRONTEND_URL
    : "*",
  credentials: true,
}));

// Parse JSON body
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ==========================================
// Routes
// ==========================================

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api", routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Không tìm thấy route: ${req.method} ${req.originalUrl}` });
});

// Global error handler (phải đặt cuối cùng)
app.use(errorHandler);

module.exports = app;
