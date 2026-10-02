const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ProductImage = sequelize.define("ProductImage", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "products",
      key: "id",
    },
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  alt: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: "",
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: "product_images",
  timestamps: false,
});

module.exports = ProductImage;
