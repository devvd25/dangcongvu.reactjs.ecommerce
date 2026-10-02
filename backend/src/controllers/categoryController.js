const { Category } = require("../models");

/**
 * GET /api/categories
 * Lấy tất cả danh mục
 */
const getAll = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      order: [["id", "ASC"]],
    });
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/categories/:id
 * Lấy danh mục theo ID
 */
const getById = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục." });
    }
    res.json(category);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById };
