const { Order, OrderItem, Product } = require("../models");

/**
 * GET /api/orders
 * Lấy tất cả đơn hàng (Admin) hoặc theo userId (User)
 * Hỗ trợ query: ?userId={id}
 */
const getAll = async (req, res, next) => {
  try {
    const { userId } = req.query;

    const whereClause = userId ? { user_id: userId } : {};

    const orders = await Order.findAll({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          as: "items",
        },
      ],
      order: [["order_time", "DESC"]],
    });

    // Format response tương thích frontend
    const formatted = orders.map((order) => formatOrder(order));
    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/orders
 * Tạo đơn hàng mới
 * Body: { userId, items: [{productId, quantity}], totalPrice, orderTime, name, address, phone }
 */
const createOrder = async (req, res, next) => {
  try {
    const { userId, items, totalPrice, orderTime, name, address, phone } = req.body;

    // Tạo order
    const order = await Order.create({
      user_id: userId,
      total_price: totalPrice,
      order_time: orderTime || new Date(),
      recipient_name: name,
      address,
      phone,
      status: "pending",
    });

    // Tạo order items
    if (items && Array.isArray(items)) {
      const orderItems = [];
      for (const item of items) {
        // Lấy giá sản phẩm tại thời điểm đặt
        const product = await Product.findByPk(item.productId);
        orderItems.push({
          order_id: order.id,
          product_id: item.productId,
          quantity: item.quantity,
          price: product ? product.discount_price : 0,
        });
      }
      await OrderItem.bulkCreate(orderItems);
    }

    // Reload order với items
    const result = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: "items" }],
    });

    res.status(201).json(formatOrder(result));
  } catch (error) {
    next(error);
  }
};

/**
 * Helper: Format order cho frontend (tương thích db.json format)
 */
function formatOrder(order) {
  const o = order.toJSON();
  return {
    id: String(o.id),
    userId: String(o.user_id),
    items: o.items.map((item) => ({
      productId: String(item.product_id),
      quantity: item.quantity,
    })),
    totalPrice: parseFloat(o.total_price),
    orderTime: o.order_time,
    name: o.recipient_name,
    address: o.address,
    phone: o.phone,
    status: o.status,
  };
}

module.exports = { getAll, createOrder };
