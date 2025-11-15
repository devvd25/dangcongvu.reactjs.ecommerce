// Tạo 1 axios client chung
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // backend của bạn
  timeout: 10000
});

export default api;
