import axios from "axios";

// Ưu tiên VITE_API_URL từ biến môi trường (build-time trong Vite)
// Nếu không cấu hình (vd: chạy local dev npm run dev), mặc định về http://localhost:8000
const baseUrl =
  import.meta.env.VITE_API_URL !== undefined
    ? import.meta.env.VITE_API_URL
    : "http://localhost:8000";

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
