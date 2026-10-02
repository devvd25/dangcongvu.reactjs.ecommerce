const { Product, ProductImage, Category, CartItem } = require("../models");

/**
 * GET /api/products
 * Lấy tất cả sản phẩm kèm images
 * Response format tương thích frontend: images là mảng [{url, alt}]
 */
const getAll = async (req, res, next) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: ProductImage,
          as: "images",
          attributes: ["url", "alt"],
        },
      ],
      order: [["id", "ASC"]],
    });

    // Format response tương thích db.json (categoryId thay vì category_id)
    const formatted = products.map((p) => formatProduct(p));
    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/:id
 * Chi tiết sản phẩm
 */
const getById = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: ProductImage,
          as: "images",
          attributes: ["url", "alt"],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    }

    res.json(formatProduct(product));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/products
 * Tạo sản phẩm mới (Admin)
 */
const createProduct = async (req, res, next) => {
  try {
    const {
      categoryId,
      name,
      model,
      costPrice,
      salePrice,
      discountPrice,
      description,
      specification,
      images,
      type,
      features,
      promotions,
      stock,
    } = req.body;

    // Giá trị mặc định
    const defaultFeatures = [
      "Bảo hành chính hãng 12 tháng",
      "Giao hàng miễn phí",
    ];
    const defaultPromotions = [
      "Giảm thêm 5% khi thanh toán online",
      "Tặng phiếu mua hàng 500.000đ",
    ];

    const product = await Product.create({
      category_id: categoryId,
      name,
      model,
      cost_price: costPrice || 0,
      sale_price: salePrice || 0,
      discount_price: discountPrice || 0,
      description,
      specification,
      type,
      features: features || defaultFeatures,
      promotions: promotions || defaultPromotions,
      stock: stock !== undefined ? stock : 0,
      rating: 4.5,
    });

    // Tạo images nếu có
    if (images && Array.isArray(images)) {
      const imageRecords = images.map((img, index) => ({
        product_id: product.id,
        url: img.url,
        alt: img.alt || "",
        sort_order: index,
      }));
      await ProductImage.bulkCreate(imageRecords);
    }

    // Reload product với images
    const result = await Product.findByPk(product.id, {
      include: [{ model: ProductImage, as: "images", attributes: ["url", "alt"] }],
    });

    res.status(201).json({ status: 201, data: formatProduct(result) });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/products/:id
 * Cập nhật sản phẩm (Admin)
 */
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    }

    const {
      categoryId, name, model, costPrice, salePrice, discountPrice,
      description, specification, images, type, features, promotions, stock,
    } = req.body;

    // Cập nhật các trường
    product.category_id = categoryId || product.category_id;
    product.name = name || product.name;
    product.model = model || product.model;
    product.cost_price = costPrice || product.cost_price;
    product.sale_price = salePrice || product.sale_price;
    product.discount_price = discountPrice || product.discount_price;
    product.description = description || product.description;
    product.specification = specification || product.specification;
    product.type = type || product.type;
    product.features = features || product.features;
    product.promotions = promotions || product.promotions;
    if (stock !== undefined) product.stock = stock;
    product.rating = 4.5;

    await product.save();

    // Cập nhật images nếu có
    if (images && Array.isArray(images)) {
      await ProductImage.destroy({ where: { product_id: product.id } });
      const imageRecords = images.map((img, index) => ({
        product_id: product.id,
        url: img.url,
        alt: img.alt || "",
        sort_order: index,
      }));
      await ProductImage.bulkCreate(imageRecords);
    }

    const result = await Product.findByPk(product.id, {
      include: [{ model: ProductImage, as: "images", attributes: ["url", "alt"] }],
    });

    res.json(formatProduct(result));
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/products/:id
 * Cập nhật một phần sản phẩm (VD: stock)
 */
const patchProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    }

    // Chỉ cập nhật các trường được gửi lên
    const allowedFields = [
      "stock", "name", "cost_price", "sale_price", "discount_price",
      "description", "rating",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    }

    await product.save();

    const result = await Product.findByPk(product.id, {
      include: [{ model: ProductImage, as: "images", attributes: ["url", "alt"] }],
    });

    res.json(formatProduct(result));
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/products/:id
 * Xóa sản phẩm (Admin) — kiểm tra xem sản phẩm có trong giỏ hàng không
 */
const deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;

    // Kiểm tra sản phẩm có trong giỏ hàng không
    const inCart = await CartItem.findOne({ where: { product_id: productId } });
    if (inCart) {
      return res.status(400).json({
        message: "Sản phẩm đang nằm trong giỏ hàng, không thể xóa.",
      });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    }

    // Xóa images trước
    await ProductImage.destroy({ where: { product_id: productId } });
    await product.destroy();

    res.json({ status: 200, data: {} });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper: Format product object cho frontend (camelCase keys)
 */
function formatProduct(product) {
  const p = product.toJSON();
  return {
    id: p.id,
    categoryId: String(p.category_id),
    name: p.name,
    model: p.model,
    costPrice: String(p.cost_price),
    salePrice: String(p.sale_price),
    discountPrice: String(p.discount_price),
    description: p.description,
    specification: p.specification,
    images: p.images || [],
    type: p.type,
    features: p.features,
    promotions: p.promotions,
    stock: String(p.stock),
    rating: p.rating,
  };
}

module.exports = { getAll, getById, createProduct, updateProduct, patchProduct, deleteProduct };
