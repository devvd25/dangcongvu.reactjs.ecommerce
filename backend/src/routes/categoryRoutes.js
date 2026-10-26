const router = require("express").Router();
const categoryController = require("../controllers/categoryController");
const { verifyToken, isAdmin } = require("../middlewares/auth");

// GET /api/categories (public)
router.get("/", categoryController.getAll);

// GET /api/categories/:id (public)
router.get("/:id", categoryController.getById);

// POST /api/categories (Admin)
router.post("/", verifyToken, isAdmin, categoryController.createCategory);

// PUT /api/categories/:id (Admin)
router.put("/:id", verifyToken, isAdmin, categoryController.updateCategory);

// DELETE /api/categories/:id (Admin)
router.delete("/:id", verifyToken, isAdmin, categoryController.deleteCategory);

module.exports = router;
