const router = require("express").Router();
const userController = require("../controllers/userController");
const { verifyToken, isAdmin } = require("../middlewares/auth");

// GET /api/users (hỗ trợ ?email=, ?phone=)
router.get("/", userController.getAll);

// GET /api/users/:id
router.get("/:id", verifyToken, userController.getById);

// POST /api/users (Admin tạo user mới)
router.post("/", verifyToken, isAdmin, userController.createUser);

// PUT /api/users/:id (Admin cập nhật user)
router.put("/:id", verifyToken, isAdmin, userController.updateUser);

// DELETE /api/users/:id (Admin xóa user)
router.delete("/:id", verifyToken, isAdmin, userController.deleteUser);

module.exports = router;
