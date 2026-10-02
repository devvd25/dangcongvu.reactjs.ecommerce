const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Product = sequelize.define("Product", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "categories",
      key: "id",
    },
  },
  name: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  model: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  cost_price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
  },
  sale_price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
  },
  discount_price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  specification: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: "JSON object: {screen, chip, storage, battery, connectivity}",
  },
  type: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  features: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: "JSON array of feature strings",
  },
  promotions: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: "JSON array of promotion strings",
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 4.5,
  },
}, {
  tableName: "products",
});

module.exports = Product;
