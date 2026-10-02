const { FeaturedProduct, Product, ProductImage } = require("../models");

/**
 * GET /api/flashSales
 * Lấy danh sách sản phẩm Flash Sale
 * Response format: [{id, productId}] — tương thích db.json
 */
const getFlashSales = async (req, res, next) => {
  try {
    const featured = await FeaturedProduct.findAll({
      where: { type: "flash_sale" },
      order: [["id", "ASC"]],
    });

    const formatted = featured.map((f) => ({
      id: String(f.id),
      productId: String(f.product_id),
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/highQuality
 * Lấy danh sách sản phẩm chất lượng cao
 */
const getHighQuality = async (req, res, next) => {
  try {
    const featured = await FeaturedProduct.findAll({
      where: { type: "high_quality" },
      order: [["id", "ASC"]],
    });

    const formatted = featured.map((f) => ({
      id: String(f.id),
      productId: String(f.product_id),
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/samsung
 * Lấy danh sách sản phẩm Samsung
 */
const getSamsung = async (req, res, next) => {
  try {
    const featured = await FeaturedProduct.findAll({
      where: { type: "samsung" },
      order: [["id", "ASC"]],
    });

    const formatted = featured.map((f) => ({
      id: String(f.id),
      productId: String(f.product_id),
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

module.exports = { getFlashSales, getHighQuality, getSamsung };
