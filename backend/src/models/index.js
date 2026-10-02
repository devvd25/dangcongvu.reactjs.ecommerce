const sequelize = require("../config/database");
const User = require("./User");
const Category = require("./Category");
const Product = require("./Product");
const ProductImage = require("./ProductImage");
const Cart = require("./Cart");
const CartItem = require("./CartItem");
const Order = require("./Order");
const OrderItem = require("./OrderItem");
const FeaturedProduct = require("./FeaturedProduct");

// ==========================================
// Associations (Quan hệ giữa các bảng)
// ==========================================

// User <-> Cart (1:1)
User.hasOne(Cart, { foreignKey: "user_id", as: "cart", onDelete: "CASCADE" });
Cart.belongsTo(User, { foreignKey: "user_id", as: "user", onDelete: "CASCADE" });

// User <-> Order (1:N)
User.hasMany(Order, { foreignKey: "user_id", as: "orders", onDelete: "CASCADE" });
Order.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Category <-> Product (1:N)
Category.hasMany(Product, { foreignKey: "category_id", as: "products" });
Product.belongsTo(Category, { foreignKey: "category_id", as: "category" });

// Product <-> ProductImage (1:N)
Product.hasMany(ProductImage, { foreignKey: "product_id", as: "images", onDelete: "CASCADE" });
ProductImage.belongsTo(Product, { foreignKey: "product_id", as: "product", onDelete: "CASCADE" });

// Cart <-> CartItem (1:N)
Cart.hasMany(CartItem, { foreignKey: "cart_id", as: "items", onDelete: "CASCADE" });
CartItem.belongsTo(Cart, { foreignKey: "cart_id", as: "cart", onDelete: "CASCADE" });

// CartItem <-> Product
CartItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });
Product.hasMany(CartItem, { foreignKey: "product_id", as: "cartItems", onDelete: "CASCADE" });

// Order <-> OrderItem (1:N)
Order.hasMany(OrderItem, { foreignKey: "order_id", as: "items", onDelete: "CASCADE" });
OrderItem.belongsTo(Order, { foreignKey: "order_id", as: "order", onDelete: "CASCADE" });

// OrderItem <-> Product
OrderItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });
Product.hasMany(OrderItem, { foreignKey: "product_id", as: "orderItems", onDelete: "CASCADE" });

// FeaturedProduct <-> Product
FeaturedProduct.belongsTo(Product, { foreignKey: "product_id", as: "product", onDelete: "CASCADE" });
Product.hasMany(FeaturedProduct, { foreignKey: "product_id", as: "featuredEntries", onDelete: "CASCADE" });

module.exports = {
  sequelize,
  User,
  Category,
  Product,
  ProductImage,
  Cart,
  CartItem,
  Order,
  OrderItem,
  FeaturedProduct,
};
