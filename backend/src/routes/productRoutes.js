const router = require("express").Router();
const productController = require("../controllers/productController");
const { verifyToken, isAdmin } = require("../middlewares/auth");

// GET /api/products (public)
router.get("/", productController.getAll);

// GET /api/products/:id (public)
router.get("/:id", productController.getById);

// POST /api/products (Admin)
router.post("/", verifyToken, isAdmin, productController.createProduct);

// PUT /api/products/:id (Admin)
router.put("/:id", verifyToken, isAdmin, productController.updateProduct);

// PATCH /api/products/:id (cập nhật stock - cần token)
router.patch("/:id", verifyToken, productController.patchProduct);

// DELETE /api/products/:id (Admin)
router.delete("/:id", verifyToken, isAdmin, productController.deleteProduct);

module.exports = router;
