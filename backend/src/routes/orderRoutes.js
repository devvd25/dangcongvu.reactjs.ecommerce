const router = require("express").Router();
const orderController = require("../controllers/orderController");
const { verifyToken } = require("../middlewares/auth");

// GET /api/orders (hỗ trợ ?userId= và ?status=)
router.get("/", verifyToken, orderController.getAll);

// GET /api/orders/:id
router.get("/:id", verifyToken, orderController.getById);

// POST /api/orders (cần token)
router.post("/", verifyToken, orderController.createOrder);

// PATCH /api/orders/:id/status (admin duyệt đơn / user huỷ hoặc xác nhận đã nhận hàng)
router.patch("/:id/status", verifyToken, orderController.updateStatus);

module.exports = router;
