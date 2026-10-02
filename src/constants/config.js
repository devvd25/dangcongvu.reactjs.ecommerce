import axios from "axios";

// Ưu tiên VITE_API_URL từ biến môi trường (build-time trong Vite)
// Nếu không cấu hình (vd: chạy local dev npm run dev), mặc định về http://localhost:5000/api
const baseUrl =
  import.meta.env.VITE_API_URL !== undefined
    ? import.meta.env.VITE_API_URL
    : "http://localhost:5000/api";

const urlConfig = {
  baseUrl: `${baseUrl}`,
};

// Tạo instance axios với cấu hình mặc định
export const http = axios.create({
  baseURL: urlConfig.baseUrl, // Sử dụng baseURL từ urlConfig
  headers: {
    "Content-Type": "application/json",
  },
});

// Axios Request Interceptor: Tự động gắn JWT token vào mỗi request
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Axios Response Interceptor: Tự động Retry nếu Backend đang Cold Start (502, 503, 504)
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const status = response?.status;

    // Nếu gặp lỗi 502 / 503 / 504 hoặc mất kết nối tạm thời do server đang spin up
    if ((status === 502 || status === 503 || status === 504 || !response) && config) {
      config.__retryCount = config.__retryCount || 0;
      const MAX_RETRIES = 3;

      if (config.__retryCount < MAX_RETRIES) {
        config.__retryCount += 1;
        console.warn(`[API] Máy chủ đang khởi động, thử lại lần ${config.__retryCount}/${MAX_RETRIES}...`);
        
        // Chờ 2 giây rồi tự động gọi lại
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return http(config);
      }
    }

    return Promise.reject(error);
  }
);

