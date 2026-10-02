const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const { User, Cart, CartItem } = require("../models");

/**
 * GET /api/users
 * Lấy tất cả users (Admin)
 * Hỗ trợ query: ?email=xxx hoặc ?phone=xxx để kiểm tra tồn tại
 */
const getAll = async (req, res, next) => {
  try {
    const { email, phone } = req.query;

    // Nếu có query email hoặc phone → trả mảng kết quả (tương thích json-server)
    if (email) {
      const users = await User.findAll({
        where: { email },
        attributes: { exclude: ["password"] },
      });
      return res.json(users);
    }

    if (phone) {
      const users = await User.findAll({
        where: { phone },
        attributes: { exclude: ["password"] },
      });
      return res.json(users);
    }

    // Lấy tất cả users
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:id
 * Lấy user theo ID
 */
const getById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
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
 * POST /api/users
 * Tạo user mới (Admin) + tự động tạo giỏ hàng
 */
const createUser = async (req, res, next) => {
  try {
    const { email, password, username, phone, role } = req.body;

    // Kiểm tra email tồn tại
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: "Email đã tồn tại." });
    }

    // Kiểm tra phone tồn tại
    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) {
      return res.status(400).json({ message: "Số điện thoại đã tồn tại." });
    }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      username,
      phone,
      role: role || "user",
    });

    // Tạo giỏ hàng cho user mới
    await Cart.create({ user_id: user.id });

    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    res.status(201).json(userData);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/:id
 * Cập nhật user (Admin)
 */
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    const { email, username, phone, role, password } = req.body;

    // Kiểm tra email trùng
    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(400).json({ message: "Email đã tồn tại." });
      }
    }

    // Kiểm tra phone trùng
    if (phone && phone !== user.phone) {
      const existing = await User.findOne({ where: { phone } });
      if (existing) {
        return res.status(400).json({ message: "Số điện thoại đã tồn tại." });
      }
    }

    // Cập nhật
    user.email = email || user.email;
    user.username = username || user.username;
    user.phone = phone || user.phone;
    if (role !== undefined) user.role = role;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();

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

/**
 * DELETE /api/users/:id
 * Xóa user (Admin)
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    // Xóa cart và cart items liên quan trước
    const cart = await Cart.findOne({ where: { user_id: user.id } });
    if (cart) {
      await CartItem.destroy({ where: { cart_id: cart.id } });
      await cart.destroy();
    }

    await user.destroy();
    res.json({ message: "Xóa người dùng thành công." });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, createUser, updateUser, deleteUser };
