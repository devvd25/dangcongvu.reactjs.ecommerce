const { Cart, CartItem, Product, ProductImage } = require("../models");

/**
 * GET /api/carts?userId={id}
 * Lấy giỏ hàng theo user
 * Response format tương thích frontend: [{id, userId, items: [{productId, quantity}]}]
 */
const getCart = async (req, res, next) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ message: "Thiếu userId." });
    }

    let cart = await Cart.findOne({
      where: { user_id: userId },
      include: [
        {
          model: CartItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id"],
            },
          ],
        },
      ],
    });

    if (!cart) {
      // Tạo cart mới nếu chưa có
      cart = await Cart.create({ user_id: userId });
      return res.json([{
        id: cart.id,
        userId: String(userId),
        items: [],
      }]);
    }

    // Format response tương thích frontend
    const formatted = {
      id: cart.id,
      userId: String(cart.user_id),
      items: cart.items.map((item) => ({
        productId: String(item.product_id),
        quantity: item.quantity,
      })),
    };

    // Frontend mong đợi một mảng
    res.json([formatted]);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/carts/add
 * Thêm sản phẩm vào giỏ hàng
 * Body: { userId, productId, quantity }
 */
const addToCart = async (req, res, next) => {
  try {
    const { userId, productId, quantity = 1 } = req.body;

    // Tìm hoặc tạo cart
    let cart = await Cart.findOne({ where: { user_id: userId } });
    if (!cart) {
      cart = await Cart.create({ user_id: userId });
    }

    // Kiểm tra sản phẩm đã có trong giỏ chưa
    let cartItem = await CartItem.findOne({
      where: { cart_id: cart.id, product_id: productId },
    });

    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({
        cart_id: cart.id,
        product_id: productId,
        quantity,
      });
    }

    // Reload cart với items mới
    const updatedCart = await getFormattedCart(cart.id, userId);
    res.json(updatedCart);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/carts/update
 * Cập nhật số lượng sản phẩm trong giỏ
 * Body: { userId, productId, quantity }
 */
const updateCart = async (req, res, next) => {
  try {
    const { userId, productId, quantity } = req.body;

    const cart = await Cart.findOne({ where: { user_id: userId } });
    if (!cart) {
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng." });
    }

    const cartItem = await CartItem.findOne({
      where: { cart_id: cart.id, product_id: productId },
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Sản phẩm không có trong giỏ hàng." });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    const updatedCart = await getFormattedCart(cart.id, userId);
    res.json(updatedCart);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/carts/remove
 * Xóa sản phẩm khỏi giỏ hàng
 * Body: { userId, productId }
 */
const removeFromCart = async (req, res, next) => {
  try {
    const { userId, productId } = req.body;

    const cart = await Cart.findOne({ where: { user_id: userId } });
    if (!cart) {
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng." });
    }

    await CartItem.destroy({
      where: { cart_id: cart.id, product_id: productId },
    });

    const updatedCart = await getFormattedCart(cart.id, userId);
    res.json(updatedCart);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/carts/reset
 * Làm trống giỏ hàng
 * Body: { userId }
 */
const resetCart = async (req, res, next) => {
  try {
    const { userId } = req.body;

    const cart = await Cart.findOne({ where: { user_id: userId } });
    if (!cart) {
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng." });
    }

    await CartItem.destroy({ where: { cart_id: cart.id } });

    const updatedCart = await getFormattedCart(cart.id, userId);
    res.json(updatedCart);
  } catch (error) {
    next(error);
  }
};

/**
 * Helper: Lấy cart đã format cho frontend
 */
async function getFormattedCart(cartId, userId) {
  const cart = await Cart.findByPk(cartId, {
    include: [{ model: CartItem, as: "items" }],
  });

  return {
    id: cart.id,
    userId: String(userId),
    items: cart.items.map((item) => ({
      productId: String(item.product_id),
      quantity: item.quantity,
    })),
  };
}

module.exports = { getCart, addToCart, updateCart, removeFromCart, resetCart };
