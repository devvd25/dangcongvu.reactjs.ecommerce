const router = require("express").Router();
const categoryController = require("../controllers/categoryController");

// GET /api/categories (public)
router.get("/", categoryController.getAll);

// GET /api/categories/:id (public)
router.get("/:id", categoryController.getById);

module.exports = router;
