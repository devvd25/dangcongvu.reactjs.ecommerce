const router = require("express").Router();

const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const productRoutes = require("./productRoutes");
const categoryRoutes = require("./categoryRoutes");
const cartRoutes = require("./cartRoutes");
const orderRoutes = require("./orderRoutes");
const featuredRoutes = require("./featuredRoutes");

// Đăng ký tất cả routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/carts", cartRoutes);
router.use("/orders", orderRoutes);

// Featured routes (mount trực tiếp, không có prefix chung)
router.use("/", featuredRoutes);

module.exports = router;
