const { Order, OrderItem, Product, ProductImage, User, Category } = require("../models");

const LOW_STOCK_THRESHOLD = 5;
const DAY_MS = 24 * 3600 * 1000;

// Ngày theo giờ Việt Nam (UTC+7), dạng YYYY-MM-DD - server chạy giờ UTC
const vnDay = (date) => new Date(new Date(date).getTime() + 7 * 3600 * 1000).toISOString().slice(0, 10);

/**
 * GET /api/stats/dashboard (Admin)
 * Số liệu tổng quan cho trang Dashboard
 */
const getDashboard = async (req, res, next) => {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 7, 1), 90);

    const [orders, orderItems, products, userCount, categoryCount] = await Promise.all([
      Order.findAll({ order: [["order_time", "DESC"]] }),
      OrderItem.findAll({ include: [{ model: Order, as: "order", attributes: ["status"] }] }),
      Product.findAll({
        include: [{ model: ProductImage, as: "images", attributes: ["url"] }],
        order: [["stock", "ASC"]],
      }),
      User.count({ where: { role: "user" } }),
      Category.count(),
    ]);

    // Đếm đơn theo trạng thái + doanh thu
    const ordersByStatus = { pending: 0, confirmed: 0, shipping: 0, delivered: 0, cancelled: 0 };
    let revenue = 0; // Doanh thu đã giao thành công
    let pendingRevenue = 0; // Doanh thu đang xử lý (chưa giao, chưa huỷ)
    for (const o of orders) {
      ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1;
      const total = parseFloat(o.total_price) || 0;
      if (o.status === "delivered") revenue += total;
      else if (o.status !== "cancelled") pendingRevenue += total;
    }

    // Doanh thu theo ngày trong N ngày gần nhất (không tính đơn huỷ)
    const revenueByDay = [];
    for (let i = days - 1; i >= 0; i--) {
      revenueByDay.push({ date: vnDay(Date.now() - i * DAY_MS), revenue: 0, orders: 0 });
    }
    const dayIndex = Object.fromEntries(revenueByDay.map((d, i) => [d.date, i]));
    for (const o of orders) {
      if (o.status === "cancelled") continue;
      const idx = dayIndex[vnDay(o.order_time)];
      if (idx !== undefined) {
        revenueByDay[idx].revenue += parseFloat(o.total_price) || 0;
        revenueByDay[idx].orders += 1;
      }
    }

    // Sản phẩm bán chạy (theo số lượng trong các đơn không bị huỷ)
    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));
    const sold = {};
    for (const item of orderItems) {
      if (item.order?.status === "cancelled") continue;
      const s = (sold[item.product_id] ||= { quantity: 0, revenue: 0 });
      s.quantity += item.quantity;
      s.revenue += (parseFloat(item.price) || 0) * item.quantity;
    }
    const brief = (p) => ({
      id: p.id,
      name: p.name,
      categoryId: String(p.category_id),
      image: p.images?.[0]?.url || null,
      stock: p.stock,
      discountPrice: parseFloat(p.discount_price),
    });
    const topProducts = Object.entries(sold)
      .filter(([id]) => productMap[id])
      .map(([id, s]) => ({ ...brief(productMap[id]), sold: s.quantity, revenue: s.revenue }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);

    const lowStock = products
      .filter((p) => p.stock <= LOW_STOCK_THRESHOLD)
      .slice(0, 8)
      .map(brief);

    const recentOrders = orders.slice(0, 6).map((o) => ({
      id: String(o.id),
      name: o.recipient_name,
      totalPrice: parseFloat(o.total_price),
      orderTime: o.order_time,
      status: o.status,
    }));

    res.json({
      totals: {
        revenue,
        pendingRevenue,
        orders: orders.length,
        products: products.length,
        customers: userCount,
        categories: categoryCount,
        outOfStock: products.filter((p) => p.stock <= 0).length,
        lowStockThreshold: LOW_STOCK_THRESHOLD,
      },
      ordersByStatus,
      revenueByDay,
      topProducts,
      lowStock,
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard };
