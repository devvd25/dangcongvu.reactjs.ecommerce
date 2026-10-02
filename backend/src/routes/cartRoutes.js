const router = require("express").Router();
const cartController = require("../controllers/cartController");
const { verifyToken } = require("../middlewares/auth");

// GET /api/carts?userId={id} (cần token)
router.get("/", verifyToken, cartController.getCart);

// POST /api/carts/add (cần token)
router.post("/add", verifyToken, cartController.addToCart);

// PUT /api/carts/update (cần token)
router.put("/update", verifyToken, cartController.updateCart);

// DELETE /api/carts/remove (cần token)
router.delete("/remove", verifyToken, cartController.removeFromCart);

// POST /api/carts/reset (cần token)
router.post("/reset", verifyToken, cartController.resetCart);

module.exports = router;
