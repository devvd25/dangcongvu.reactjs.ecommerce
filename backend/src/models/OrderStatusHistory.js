const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// Lịch sử chuyển trạng thái đơn hàng (dùng để hiển thị hành trình đơn như Shopee)
const OrderStatusHistory = sequelize.define("OrderStatusHistory", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "orders",
      key: "id",
    },
  },
  status: {
    type: DataTypes.ENUM("pending", "confirmed", "shipping", "delivered", "cancelled"),
    allowNull: false,
  },
  note: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: "Ghi chú, ví dụ lý do huỷ đơn",
  },
  changed_by: {
    type: DataTypes.ENUM("user", "admin", "system"),
    allowNull: false,
    defaultValue: "system",
  },
}, {
  tableName: "order_status_histories",
  updatedAt: false,
});

module.exports = OrderStatusHistory;
