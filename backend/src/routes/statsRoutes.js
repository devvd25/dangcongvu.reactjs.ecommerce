const router = require("express").Router();
const statsController = require("../controllers/statsController");
const { verifyToken, isAdmin } = require("../middlewares/auth");

// GET /api/stats/dashboard?days=7 (Admin)
router.get("/dashboard", verifyToken, isAdmin, statsController.getDashboard);

module.exports = router;
