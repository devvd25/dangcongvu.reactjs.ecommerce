const router = require("express").Router();
const authController = require("../controllers/authController");
const { verifyToken } = require("../middlewares/auth");

// POST /api/auth/register
router.post("/register", authController.register);

// POST /api/auth/login
router.post("/login", authController.login);

// GET /api/auth/profile (cần token)
router.get("/profile", verifyToken, authController.getProfile);

// PUT /api/auth/profile (cần token)
router.put("/profile", verifyToken, authController.updateProfile);

module.exports = router;
