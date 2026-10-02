const router = require("express").Router();
const featuredController = require("../controllers/featuredController");

// GET /api/flashSales (public)
router.get("/flashSales", featuredController.getFlashSales);

// GET /api/highQuality (public)
router.get("/highQuality", featuredController.getHighQuality);

// GET /api/samsung (public)
router.get("/samsung", featuredController.getSamsung);

module.exports = router;
