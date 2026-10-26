const { Category, Product } = require("../models");

/**
 * GET /api/categories
 * Lấy tất cả danh mục
 */
const getAll = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      order: [["id", "ASC"]],
    });
    // Kèm số sản phẩm của mỗi danh mục (cho trang quản lý danh mục)
    const counts = await Product.count({ group: ["category_id"] });
    const countMap = Object.fromEntries(counts.map((c) => [String(c.category_id), Number(c.count)]));
    res.json(categories.map((c) => ({ ...c.toJSON(), productCount: countMap[String(c.id)] || 0 })));
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

const toSlug = (text) =>
  String(text)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * POST /api/categories (Admin)
 * Body: { name, slug?, image?, status? }
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, slug, image, status } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Tên danh mục không được để trống." });
    }
    const finalSlug = toSlug(slug || name);
    if (await Category.findOne({ where: { slug: finalSlug } })) {
      return res.status(400).json({ message: `Slug "${finalSlug}" đã tồn tại.` });
    }
    const category = await Category.create({
      name: name.trim(),
      slug: finalSlug,
      image: image || "",
      status: status !== false,
    });
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/categories/:id (Admin)
 */
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục." });
    }
    const { name, slug, image, status } = req.body;
    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ message: "Tên danh mục không được để trống." });
      category.name = name.trim();
    }
    if (slug !== undefined || name !== undefined) {
      const finalSlug = toSlug(slug || category.name);
      const exists = await Category.findOne({ where: { slug: finalSlug } });
      if (exists && exists.id !== category.id) {
        return res.status(400).json({ message: `Slug "${finalSlug}" đã tồn tại.` });
      }
      category.slug = finalSlug;
    }
    if (image !== undefined) category.image = image;
    if (status !== undefined) category.status = Boolean(status);
    await category.save();
    res.json(category);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/categories/:id (Admin)
 * Không cho xoá danh mục đang có sản phẩm
 */
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục." });
    }
    const productCount = await Product.count({ where: { category_id: category.id } });
    if (productCount > 0) {
      return res.status(400).json({
        message: `Danh mục đang có ${productCount} sản phẩm. Hãy chuyển hoặc xoá sản phẩm trước.`,
      });
    }
    await category.destroy();
    res.json({ message: "Đã xoá danh mục." });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, createCategory, updateCategory, deleteCategory };
