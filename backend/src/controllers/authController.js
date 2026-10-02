const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Cart } = require("../models");

/**
 * POST /api/auth/register
 * Đăng ký tài khoản mới + tự động tạo giỏ hàng
 */
const register = async (req, res, next) => {
  try {
    const { email, password, username, phone } = req.body;

    // Kiểm tra email đã tồn tại
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: "Email đã tồn tại." });
    }

    // Kiểm tra phone đã tồn tại
    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) {
      return res.status(400).json({ message: "Số điện thoại đã tồn tại." });
    }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user
    const user = await User.create({
      email,
      password: hashedPassword,
      username,
      phone,
      role: "user",
    });

    // Tạo giỏ hàng cho user mới
    const cart = await Cart.create({ user_id: user.id });

    // Tạo JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    // Trả về response tương thích với frontend
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    res.status(201).json({
      data: userData,
      cart: { id: cart.id, userId: user.id, items: [] },
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Đăng nhập bằng email/phone + password, trả về JWT token
 */
const login = async (req, res, next) => {
  try {
    const { emailOrPhone, password } = req.body;

    // Tìm user theo email hoặc phone
    const { Op } = require("sequelize");
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: emailOrPhone },
          { phone: emailOrPhone },
        ],
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Email hoặc số điện thoại không tồn tại." });
    }

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu không đúng." });
    }

    // Tạo JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    // Trả về response tương thích với frontend
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    res.json({ data: userData, token });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/profile
 * Lấy thông tin user từ JWT token
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/auth/profile
 * Cập nhật thông tin cá nhân
 */
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    const { username, email, phone, password } = req.body;

    // Kiểm tra email trùng (nếu đổi email)
    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(400).json({ message: "Email đã tồn tại." });
      }
    }

    // Kiểm tra phone trùng (nếu đổi phone)
    if (phone && phone !== user.phone) {
      const existing = await User.findOne({ where: { phone } });
      if (existing) {
        return res.status(400).json({ message: "Số điện thoại đã tồn tại." });
      }
    }

    // Cập nhật các trường
    if (username) user.username = username;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();

    // Trả về user không kèm password
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    res.json(userData);
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getProfile, updateProfile };
