import { http } from "../constants/config";
import { setTokenToLS } from "../utils/auth";

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
    try {
      const response = await http.post("/auth/register", data);
      if (response.data?.token) {
        setTokenToLS(response.data.token);
      }
      return { user: response.data.data, cart: response.data.cart };
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Đăng ký thất bại.";
      throw new Error(msg);
    }
  },

  login: async (data) => {
    const { emailOrPhone, password } = data;
    try {
      const response = await http.post("/auth/login", { emailOrPhone, password });
      if (response.data?.token) {
        setTokenToLS(response.data.token);
      }
      return { data: response.data.data };
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Đăng nhập thất bại.";
      throw new Error(msg);
    }
  },

  getProfile: (id) => http.get(`${BASE_USER_URL}/${id}`),
  updateProfile: (id, data) => http.put(`${BASE_USER_URL}/${id}`, data),

  cart: {
    get: (userId) => http.get(`${BASE_CART_URL}?userId=${userId}`),
    addProductToCart: async (userId, productId, quantity) => {
      return http.post(`${BASE_CART_URL}/add`, { userId, productId, quantity });
    },
    updateCart: async (userId, productId, quantity) => {
      return http.put(`${BASE_CART_URL}/update`, { userId, productId, quantity });
    },
    removeProductToCart: async (userId, productId) => {
      return http.delete(`${BASE_CART_URL}/remove`, { data: { userId, productId } });
    },
    resetCart: async (userId) => {
      return http.post(`${BASE_CART_URL}/reset`, { userId });
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
