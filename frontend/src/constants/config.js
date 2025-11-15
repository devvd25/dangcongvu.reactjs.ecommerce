// frontend/src/api/axios.js (nếu chưa có)
import axios from "axios";
export const http = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 10000,
});
export default http;
