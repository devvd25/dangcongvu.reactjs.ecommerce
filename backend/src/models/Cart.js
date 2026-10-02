const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Cart = sequelize.define("Cart", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true, // 1 user = 1 cart
    references: {
      model: "users",
      key: "id",
    },
  },
}, {
  tableName: "carts",
});

module.exports = Cart;
