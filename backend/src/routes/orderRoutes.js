const router = require("express").Router();
const orderController = require("../controllers/orderController");
const { verifyToken } = require("../middlewares/auth");

// GET /api/orders (hỗ trợ ?userId=)
router.get("/", verifyToken, orderController.getAll);

// POST /api/orders (cần token)
router.post("/", verifyToken, orderController.createOrder);

module.exports = router;
