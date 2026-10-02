const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FeaturedProduct = sequelize.define("FeaturedProduct", {
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
  type: {
    type: DataTypes.ENUM("flash_sale", "high_quality", "samsung"),
    allowNull: false,
    comment: "Loại sản phẩm nổi bật: flash_sale, high_quality, samsung",
  },
}, {
  tableName: "featured_products",
  timestamps: false,
});

module.exports = FeaturedProduct;
