import { http } from "../constants/config";

const BASE_USER_URL = "/users";
const BASE_PRODUCT_URL = "/products";
const BASE_ORDER_URL = "/orders";
const BASE_CATEGORY_URL = "/categories";
const BASE_FLASHSALE_URL = "/flashSales";
const BASE_HIGH_QUALITY_URL = "/highQuality";
const BASE_SAMSUNG_URL = "/samsung";
const BASE_CART_URL = "/carts";

export const userAPI = {
  // API người dùng
  checkEmailExists: (email) =>
    http.get(`${BASE_USER_URL}?email=${email}`).then((res) => ({
      exists: res.data.length > 0,
    })),

  checkPhoneExists: (phone) =>
    http.get(`${BASE_USER_URL}?phone=${phone}`).then((res) => ({
      exists: res.data.length > 0,
    })),

  register: async (data) => {
    const { email, password, username, phone } = data;

    const emailExists = await userAPI.checkEmailExists(email);
    if (emailExists.exists) throw new Error("Email đã tồn tại.");

    const phoneExists = await userAPI.checkPhoneExists(phone);
    if (phoneExists.exists) throw new Error("Số điện thoại đã tồn tại.");

    const userResponse = await http.post(BASE_USER_URL, {
      email,
      password,
      username,
      phone,
      role: "user",
    });
    const cartResponse = await http.post(BASE_CART_URL, {
      userId: userResponse.data.id,
      items: [],
    });

    return { user: userResponse.data, cart: cartResponse.data };
  },

  login: async (data) => {
    const { emailOrPhone, password } = data;

    const userResponse = await http.get(
      `${BASE_USER_URL}?email=${emailOrPhone}`
    );
    const phoneResponse = await http.get(
      `${BASE_USER_URL}?phone=${emailOrPhone}`
    );

    const user =
      userResponse.data.length > 0
        ? userResponse.data[0]
        : phoneResponse.data.length > 0
        ? phoneResponse.data[0]
        : null;

    if (!user) throw new Error("Email hoặc số điện thoại không tồn tại.");
    if (user.password !== password) throw new Error("Mật khẩu không đúng.");

    return { data: user };
  },

  getProfile: (id) => http.get(`${BASE_USER_URL}/${id}`),
  updateProfile: (id, data) => http.put(`${BASE_USER_URL}/${id}`, data),

  cart: {
    get: (userId) => http.get(`${BASE_CART_URL}?userId=${userId}`),
    addProductToCart: async (userId, productId, quantity) => {
      const response = await http.get(`${BASE_CART_URL}?userId=${userId}`);
      const userCart =
        response.data[0] ||
        (await http.post(BASE_CART_URL, { userId, items: [] }));

      const existingItem = userCart.items.find(
        (item) => item.productId === productId
      );
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        userCart.items.push({ productId, quantity });
      }
      return http.put(`${BASE_CART_URL}/${userCart.id}`, userCart);
    },
    updateCart: async (userId, productId, quantity) => {
      const response = await http.get(`${BASE_CART_URL}?userId=${userId}`);
      const userCart = response.data[0];

      if (userCart) {
        const existingItem = userCart.items.find(
          (item) => item.productId === productId
        );
        if (existingItem) {
          existingItem.quantity = quantity;
          return http.put(`${BASE_CART_URL}/${userCart.id}`, userCart);
        }
      }
      throw new Error("Product not found in cart");
    },
    removeProductToCart: async (userId, productId) => {
      const response = await http.get(`${BASE_CART_URL}?userId=${userId}`);
      const userCart = response.data[0];

      if (userCart) {
        userCart.items = userCart.items.filter(
          (item) => item.productId !== productId
        );
        return http.put(`${BASE_CART_URL}/${userCart.id}`, userCart);
      }
      throw new Error("Cart not found");
    },
    resetCart: async (userId) => {
      const response = await http.get(`${BASE_CART_URL}?userId=${userId}`);
      const userCart = response.data[0];

      if (userCart) {
        userCart.items = []; // Làm sạch giỏ hàng
        return http.put(`${BASE_CART_URL}/${userCart.id}`, userCart);
      }
      throw new Error("Cart not found");
    },
  },

  product: {
    getAll: () => http.get(BASE_PRODUCT_URL),
    getById: (id) => http.get(`${BASE_PRODUCT_URL}/${id}`),
    updateStock: async (productId, newStock) => {
      try {
        const response = await http.patch(`${BASE_PRODUCT_URL}/${productId}`, {
          stock: newStock,
        });
        return response.data;
      } catch (error) {
        console.error("Failed to update stock:", error);
        throw new Error("Failed to update stock");
      }
    },
  },

  order: {
    getAll: (userId) => http.get(`${BASE_ORDER_URL}?userId=${userId}`),
    create: async (orderData) => {
      try {
        const response = await http.post(BASE_ORDER_URL, orderData);
        return response.data;
      } catch (error) {
        console.error("Error creating order:", error);
        throw new Error("Failed to create order");
      }
    },
    getOrdersByUserId: async (userId) => {
      try {
        const response = await http.get(`${BASE_ORDER_URL}?userId=${userId}`);
        return response.data; // Giả định rằng API trả về một mảng các đơn hàng
      } catch (error) {
        console.error("Error fetching orders by user ID:", error);
        throw new Error("Failed to fetch orders");
      }
    },
  },

  category: {
    getAll: () => http.get(BASE_CATEGORY_URL),
    getById: (id) => http.get(`${BASE_CATEGORY_URL}/${id}`),
  },

  flashSale: {
    getAll: () => http.get(BASE_FLASHSALE_URL),
  },
  highQuality: {
    getAll: () => http.get(BASE_HIGH_QUALITY_URL),
  },
  samsung: {
    getAll: () => http.get(BASE_SAMSUNG_URL),
  },
};
