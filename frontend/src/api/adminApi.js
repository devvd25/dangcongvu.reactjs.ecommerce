import { http } from "../constants/config";

// Define common endpoints
const BASE_USER_URL = "/users";
const BASE_CART_URL = "/carts";
const BASE_PRODUCT_URL = "/products"; // Đường dẫn cho sản phẩm
const BASE_CATEGORY_URL = "/categories";
const BASE_ORDER_URL = "/orders";

export const adminAPI = {
  user: {
    // Lấy tất cả người dùng
    getAll: () => http.get(BASE_USER_URL),

    // Kiểm tra email có tồn tại không
    checkEmailExists: (email) =>
      http.get(`${BASE_USER_URL}?email=${email}`).then((res) => ({
        exists: res.data.length > 0,
      })),

    // Kiểm tra số điện thoại có tồn tại không
    checkPhoneExists: (phone) =>
      http.get(`${BASE_USER_URL}?phone=${phone}`).then((res) => ({
        exists: res.data.length > 0,
      })),

    // Tạo người dùng mới
    createUser: async (data) => {
      const { email, password, username, phone } = data;

      // Kiểm tra email và số điện thoại
      const emailExists = await adminAPI.user.checkEmailExists(email);
      if (emailExists.exists) {
        throw new Error("Email đã tồn tại.");
      }

      const phoneExists = await adminAPI.user.checkPhoneExists(phone);
      if (phoneExists.exists) {
        throw new Error("Số điện thoại đã tồn tại.");
      }

      // Tạo người dùng mới
      const userResponse = await http.post(BASE_USER_URL, {
        email,
        password,
        username,
        phone,
        role: "user", // Mặc định vai trò là user
      });

      // Tạo giỏ hàng mới cho người dùng
      await http.post(BASE_CART_URL, {
        userId: userResponse.data.id,
        items: [], // Giỏ hàng khởi tạo trống
      });

      return userResponse.data; // Trả về thông tin người dùng
    },

    // Đăng nhập người dùng
    login: async (data) => {
      const { emailOrPhone, password } = data;

      // Kiểm tra người dùng tồn tại
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

      if (!user) {
        throw new Error("Email hoặc số điện thoại không tồn tại.");
      }

      // Kiểm tra mật khẩu
      if (user.password !== password) {
        throw new Error("Mật khẩu không đúng.");
      }

      return { data: user }; // Trả về dữ liệu người dùng nếu đăng nhập thành công
    },

    // Cập nhật thông tin người dùng
    updateUser: async (id, data) => {
      const currentUserResponse = await http.get(`${BASE_USER_URL}/${id}`);
      const currentUserData = currentUserResponse.data;

      const updatedData = {
        email: data.email || currentUserData.email,
        username: data.username || currentUserData.username,
        phone: data.phone || currentUserData.phone,
        role: data.role !== undefined ? data.role : currentUserData.role,
      };

      const response = await http.put(`${BASE_USER_URL}/${id}`, updatedData);
      return response.data; // Trả về thông tin người dùng đã cập nhật
    },

    // Xóa người dùng
    deleteUser: async (id) => {
      const response = await http.delete(`${BASE_USER_URL}/${id}`);
      return response.data; // Trả về dữ liệu phản hồi từ API sau khi xóa
    },
  },

  // API Definition
  product: {
    // Lấy tất cả sản phẩm
    getAll: () => http.get(BASE_PRODUCT_URL),
    getById: (id) => http.get(`${BASE_PRODUCT_URL}/${id}`),

    // Tạo sản phẩm mới
    createProduct: async (data) => {
      const {
        categoryId,
        name,
        model,
        costPrice,
        salePrice,
        discountPrice,
        description,
        specification,
        images,
        type,
        features,
        promotions,
        stock,
      } = data;

      // Giá trị mặc định
      const defaultFeatures = [
        "Bảo hành chính hãng 12 tháng",
        "Giao hàng miễn phí",
      ];
      const defaultPromotions = [
        "Giảm thêm 5% khi thanh toán online",
        "Tặng phiếu mua hàng 500.000đ",
      ];
      const defaultStock = 0; // Giá trị mặc định cho stock nếu không có

      try {
        const response = await http.post(BASE_PRODUCT_URL, {
          categoryId,
          name,
          model,
          costPrice,
          salePrice,
          discountPrice,
          description,
          specification,
          images,
          type,
          features: features || defaultFeatures, // Sử dụng giá trị mặc định nếu không có
          promotions: promotions || defaultPromotions, // Sử dụng giá trị mặc định nếu không có
          stock: stock !== undefined ? stock : defaultStock, // Sử dụng giá trị mặc định nếu không có
          rating: 4.5,
        });

        return { status: response.status, data: response.data }; // Trả về status và thông tin sản phẩm đã tạo
      } catch (error) {
        console.error("Error creating product:", error);
        throw error; // Ném lỗi để xử lý bên ngoài nếu cần
      }
    },

    // Cập nhật thông tin sản phẩm
    updateProduct: async (id, data) => {
      const currentProductResponse = await http.get(
        `${BASE_PRODUCT_URL}/${id}`
      );
      const currentProductData = currentProductResponse.data;

      const updatedData = {
        categoryId: data.categoryId || currentProductData.categoryId,
        name: data.name || currentProductData.name,
        model: data.model || currentProductData.model,
        costPrice: data.costPrice || currentProductData.costPrice,
        salePrice: data.salePrice || currentProductData.salePrice,
        discountPrice: data.discountPrice || currentProductData.discountPrice,
        description: data.description || currentProductData.description,
        specification: data.specification || currentProductData.specification,
        images: data.images || currentProductData.images,
        type: data.type || currentProductData.type,
        features: data.features || currentProductData.features,
        promotions: data.promotions || currentProductData.promotions,
        stock: data.stock !== undefined ? data.stock : currentProductData.stock,
        rating: 4.5,
      };

      const response = await http.put(`${BASE_PRODUCT_URL}/${id}`, updatedData);
      return response.data; // Trả về thông tin sản phẩm đã cập nhật
    },

    // Xóa sản phẩm
    deleteProduct: async (id) => {
      try {
        // Kiểm tra xem sản phẩm có nằm trong giỏ hàng không
        const cartsResponse = await http.get(BASE_CART_URL);
        const carts = cartsResponse.data;

        // Kiểm tra từng giỏ hàng để xem sản phẩm có trong đó không
        const isInCart = carts.some((cart) =>
          cart.items.some((item) => item.productId === id)
        );

        if (isInCart) {
          throw new Error("Sản phẩm đang nằm trong giỏ hàng, không thể xóa.");
        }

        // Gửi yêu cầu xóa sản phẩm
        const response = await http.delete(`${BASE_PRODUCT_URL}/${id}`);
        return { status: response.status, data: response.data }; // Trả về status và dữ liệu phản hồi từ API
      } catch (error) {
        console.error("Error deleting product:", error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Có lỗi xảy ra khi xóa sản phẩm.";
        throw new Error(errorMessage); // Ném lỗi chi tiết để xử lý bên ngoài
      }
    },
  },
  category: {
    getAll: () => http.get(BASE_CATEGORY_URL), // Lấy tất cả danh mục
    getById: (id) => http.get(`${BASE_CATEGORY_URL}/${id}`),
  },
  order: {
    getAll: (userId) => http.get(`${BASE_ORDER_URL}`),
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
};
