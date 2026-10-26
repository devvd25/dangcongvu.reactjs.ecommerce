const { sequelize, Order, OrderItem, OrderStatusHistory, Product } = require("../models");

/**
 * Quy trình đơn hàng (giống Shopee):
 *   pending (Chờ xác nhận) -> confirmed (Chờ lấy hàng) -> shipping (Đang giao) -> delivered (Đã giao)
 *   pending / confirmed -> cancelled (Đã huỷ)
 *
 * Admin được chuyển theo đúng các bước trên.
 * User chỉ được: huỷ đơn khi đang "Chờ xác nhận", và xác nhận "Đã nhận hàng" khi đang giao.
 */
const ADMIN_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipping", "cancelled"],
  shipping: ["delivered"],
  delivered: [],
  cancelled: [],
};

const USER_TRANSITIONS = {
  pending: ["cancelled"],
  shipping: ["delivered"],
};

const ORDER_INCLUDE = [
  { model: OrderItem, as: "items" },
  { model: OrderStatusHistory, as: "statusHistory" },
];

/**
 * GET /api/orders
 * Admin: lấy tất cả đơn (hỗ trợ ?userId= và ?status=)
 * User: chỉ lấy được đơn của chính mình
 */
const getAll = async (req, res, next) => {
  try {
    const { userId, status } = req.query;
    const isAdmin = req.user.role === "admin";

    const whereClause = {};
    if (!isAdmin) {
      whereClause.user_id = req.user.id;
    } else if (userId) {
      whereClause.user_id = userId;
    }
    if (status) {
      whereClause.status = status;
    }

    const orders = await Order.findAll({
      where: whereClause,
      include: ORDER_INCLUDE,
      order: [["order_time", "DESC"]],
    });

    res.json(orders.map((order) => formatOrder(order)));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/:id
 * Chi tiết một đơn hàng (user chỉ xem được đơn của mình)
 */
const getById = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id, { include: ORDER_INCLUDE });
    if (!order || (req.user.role !== "admin" && order.user_id !== req.user.id)) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    }
    res.json(formatOrder(order));
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

    const orderId = await sequelize.transaction(async (transaction) => {
      const order = await Order.create({
        user_id: userId,
        total_price: totalPrice,
        order_time: orderTime || new Date(),
        recipient_name: name,
        address,
        phone,
        status: "pending",
      }, { transaction });

      if (items && Array.isArray(items)) {
        const orderItems = [];
        for (const item of items) {
          // Lấy giá sản phẩm tại thời điểm đặt
          const product = await Product.findByPk(item.productId, { transaction });
          orderItems.push({
            order_id: order.id,
            product_id: item.productId,
            quantity: item.quantity,
            price: product ? product.discount_price : 0,
          });
        }
        await OrderItem.bulkCreate(orderItems, { transaction });
      }

      await OrderStatusHistory.create({
        order_id: order.id,
        status: "pending",
        note: "Đơn hàng đã được đặt",
        changed_by: "user",
      }, { transaction });

      return order.id;
    });

    const result = await Order.findByPk(orderId, { include: ORDER_INCLUDE });
    res.status(201).json(formatOrder(result));
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/orders/:id/status
 * Đổi trạng thái đơn hàng
 * Body: { status, note }
 */
const updateStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const isAdmin = req.user.role === "admin";

    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, as: "items" }],
    });
    if (!order || (!isAdmin && order.user_id !== req.user.id)) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    }

    const allowed = (isAdmin ? ADMIN_TRANSITIONS : USER_TRANSITIONS)[order.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: `Không thể chuyển đơn hàng từ "${order.status}" sang "${status}".`,
      });
    }

    await sequelize.transaction(async (transaction) => {
      order.status = status;
      await order.save({ transaction });

      // Huỷ đơn thì hoàn lại tồn kho đã trừ lúc đặt hàng
      if (status === "cancelled") {
        for (const item of order.items) {
          await Product.increment("stock", {
            by: item.quantity,
            where: { id: item.product_id },
            transaction,
          });
        }
      }

      await OrderStatusHistory.create({
        order_id: order.id,
        status,
        note: note || null,
        changed_by: isAdmin ? "admin" : "user",
      }, { transaction });
    });

    const result = await Order.findByPk(order.id, { include: ORDER_INCLUDE });
    res.json(formatOrder(result));
  } catch (error) {
    next(error);
  }
};

/**
 * Helper: Format order cho frontend (tương thích db.json format)
 */
function formatOrder(order) {
  const o = order.toJSON();
  const history = (o.statusHistory || [])
    .map((h) => ({
      status: h.status,
      note: h.note,
      changedBy: h.changed_by,
      time: h.createdAt,
    }))
    .sort((a, b) => new Date(a.time) - new Date(b.time));

  // Đơn cũ (tạo trước khi có bảng lịch sử) vẫn có mốc "Đã đặt hàng"
  if (!history.some((h) => h.status === "pending")) {
    history.unshift({ status: "pending", note: "Đơn hàng đã được đặt", changedBy: "user", time: o.order_time });
  }

  return {
    id: String(o.id),
    userId: String(o.user_id),
    items: o.items.map((item) => ({
      productId: String(item.product_id),
      quantity: item.quantity,
      price: parseFloat(item.price),
    })),
    totalPrice: parseFloat(o.total_price),
    orderTime: o.order_time,
    name: o.recipient_name,
    address: o.address,
    phone: o.phone,
    status: o.status,
    statusHistory: history,
  };
}

module.exports = { getAll, getById, createOrder, updateStatus };
