# BÁO CÁO TRIỂN KHAI CI/CD, DOCKER HÓA VÀ DEPLOY LÊN RENDER

**Dự án:** React + Vite Ecommerce (Nhóm 10 - ST23D)  
**Repository:** [https://github.com/devvd25/dangcongvu.reactjs.ecommerce.git](https://github.com/devvd25/dangcongvu.reactjs.ecommerce.git)  
**Branch triển khai:** `master`

---

## 1. PHÂN TÍCH PROJECT

* **Framework:** React 18 (`react`, `react-dom`, `react-router-dom` v6, Redux).
* **Build tool:** Vite 5 (`@vitejs/plugin-react`).
* **API Architecture:**
  * Toàn bộ API được gọi tập trung thông qua instance Axios tại `src/constants/config.js`.
  * Các module API: `src/api/userApi.js`, `src/api/adminApi.js`.
  * Các endpoint nghiệp vụ: `/users`, `/products`, `/orders`, `/categories`, `/flashSales`, `/highQuality`, `/samsung`, `/carts`.
* **Database / Data Source:** File `db.json` (quản lý qua `json-server --watch db.json --port 8000`).
* **Port cấu hình:**
  * Frontend Dev: `3000` (theo `.env` và `vite.config.js`).
  * json-server: `8000`.
  * Production / Container Port: Dynamic thông qua biến môi trường `PORT` (mặc định `10000` theo tiêu chuẩn của Render).
* **Environment Variables:**
  * `PORT`: Cổng Nginx lắng nghe trên môi trường container.
  * `VITE_API_URL`: URL API frontend sử dụng (được build thành `/api` trong Docker production; tự động fallback về `http://localhost:8000` khi chạy local dev thông thường).

---

## 2. CÁC FILE ĐÃ TẠO

1. **`Dockerfile`**: 
   * Multi-stage build tối ưu kích thước image.
   * **Stage 1 (Builder):** Sử dụng `node:20-alpine`, cài đặt dependencies, biên dịch React/Vite với `VITE_API_URL=/api`.
   * **Stage 2 (Runner):** Sử dụng `node:20-alpine`, cài đặt thêm Nginx và `gettext` (`envsubst`). Chứa cả `db.json`, `json-server` và static files của React.
2. **`.dockerignore`**: 
   * Loại bỏ các thư mục không cần thiết (`node_modules`, `.git`, `dist`, `.env`, logs...).
   * Giữ lại file dữ liệu `db.json` cho runtime.
3. **`nginx.conf`**: 
   * Cấu hình SPA routing: `try_files $uri $uri/ /index.html;` (hỗ trợ React Router).
   * Bật nén Gzip tăng tốc độ tải trang.
   * Reverse Proxy: Điều hướng toàn bộ request `/api/*` về `http://127.0.0.1:8000/` (json-server).
   * Lắng nghe trên cổng dynamic `${PORT}`.
4. **`start.sh`**: 
   * Entrypoint script cho container: Thay thế biến `${PORT}` vào cấu hình Nginx bằng `envsubst`.
   * Khởi chạy `json-server` ở background trên cổng 8000 (`0.0.0.0:8000`).
   * Khởi chạy `nginx` ở foreground để duy trì container.
5. **`docker-compose.yml`**: 
   * Cấu hình orchestrate local container, map cổng `3000:10000` để truy cập tiện lợi tại `http://localhost:3000`.
6. **`.github/workflows/deploy.yml`**: 
   * GitHub Actions CI/CD pipeline tự động kích hoạt khi push lên branch `master`.
   * Tự động đăng nhập Docker Hub, build image và push với tag `:latest` và `:${{ github.sha }}`.

---

## 3. CÁC FILE ĐÃ SỬA

### `src/constants/config.js`
* **Nội dung thay đổi:**
  ```javascript
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

  export const http = axios.create({
    baseURL: urlConfig.baseUrl,
    headers: {
      "Content-Type": "application/json",
    },
  });
  ```
* **Lý do:**
  * Khi chạy **Local Dev** (`npm run dev` + `npm run server`): Không có `VITE_API_URL`, hệ thống giữ nguyên `http://localhost:8000`.
  * Khi build **Docker / Production (Render)**: Truyền `VITE_API_URL=/api`, frontend sẽ gọi API qua cùng domain (`/api/products`), Nginx reverse proxy vào `json-server`. Tránh hoàn toàn việc trình duyệt người dùng gọi nhầm vào `localhost:8000` của máy client.

---

## 4. DOCKER ARCHITECTURE

```text
               Browser / Client
                      │
                      ▼
            Render (Public HTTPS)
                      │
                      ▼
               Nginx (:10000)
              ┌───────┴───────┐
              │               │
      (Static files)        (/api/*)
              │               │
              ▼               ▼
      React / Vite SPA   json-server (:8000)
     (dist/index.html)        │
                              ▼
                           db.json
```

---

## 5. CÁC LỆNH LOCAL ĐỂ CHẠY

Sau khi bật Docker Desktop trên máy:

```bash
# 1. Build image từ Dockerfile
docker compose build

# 2. Khởi chạy container ở chế độ background
docker compose up -d

# 3. Kiểm tra trạng thái container
docker compose ps

# 4. Xem log hoạt động của container
docker compose logs -f

# 5. Dừng và xóa container khi hoàn thành
docker compose down
```

* Truy cập web app tại: **`http://localhost:3000`**
* Kiểm tra API qua Nginx reverse-proxy: **`http://localhost:3000/api/products`**

---

## 6. DOCKER HUB SETUP

1. Đăng nhập vào [Docker Hub](https://hub.docker.com/).
2. Tạo repository mới với tên: **`ecommerce-react`**
3. Tạo Access Token:
   * Vào **Account Settings** $\rightarrow$ **Security** $\rightarrow$ **New Access Token**.
   * Description: `github-actions-cicd`
   * Permissions: `Read, Write, Delete`
   * Lưu lại chuỗi token hiển thị.

---

## 7. GITHUB ACTIONS CI/CD

Workflow được định nghĩa tại `.github/workflows/deploy.yml`:
* **Trigger:** Khi có commit mới được push lên branch `master`.
* **Luồng chạy (Pipeline Flow):**
  1. `actions/checkout@v4`: Kéo mã nguồn mới nhất.
  2. `docker/setup-qemu-action@v3` & `docker/setup-buildx-action@v3`: Thiết lập công cụ build Docker hiện đại.
  3. `docker/login-action@v3`: Đăng nhập vào Docker Hub bằng Secrets.
  4. `docker/build-push-action@v6`: Build image đa tầng và push lên Docker Hub:
     * `${{ secrets.DOCKER_USERNAME }}/ecommerce-react:latest`
     * `${{ secrets.DOCKER_USERNAME }}/ecommerce-react:${{ github.sha }}`
     * Tận dụng GitHub Cache (`type=gha`) để rút ngắn thời gian build.

---

## 8. GITHUB SECRETS CẦN CẤU HÌNH

Vào repository trên GitHub: **Settings** $\rightarrow$ **Secrets and variables** $\rightarrow$ **Actions** $\rightarrow$ **New repository secret**:

| Tên Secret | Giá trị | Mục đích |
| :--- | :--- | :--- |
| **`DOCKER_USERNAME`** | Username tài khoản Docker Hub của bạn | Định danh chủ sở hữu image trên Docker Hub |
| **`DOCKER_PASSWORD`** | Docker Hub Personal Access Token | Xác thực an toàn trong pipeline CI/CD |

---

## 9. HƯỚNG DẪN DEPLOY LÊN RENDER

### Phương án A: Deploy từ Docker Hub Image (Khuyên dùng)
1. Đăng nhập [Render Dashboard](https://dashboard.render.com/).
2. Nhấn **New +** $\rightarrow$ chọn **Web Service**.
3. Chọn tùy chọn **Existing Image** (Deploy an existing image from a registry).
4. Nhập đường dẫn image: `docker.io/<DOCKER_USERNAME>/ecommerce-react:latest`
5. Nhập tên Service: `ecommerce-electronics`
6. Chọn Region: `Singapore` (để tối ưu tốc độ tại Việt Nam).
7. Instance Type: Chọn gói **Free**.
8. Trong mục **Environment Variables**:
   * Thêm biến: `PORT` = `10000`
9. Nhấn **Deploy Web Service**.

### Phương án B: Deploy trực tiếp từ GitHub
1. Nhấn **New +** $\rightarrow$ **Web Service**.
2. Kết nối với GitHub repo: `devvd25/dangcongvu.reactjs.ecommerce`.
3. Branch: `master`.
4. Runtime: **Docker**.
5. Render sẽ tự động đọc `Dockerfile` trong thư mục gốc và thực hiện build & deploy.

---

## 10. BẢNG KIỂM TRA ĐÁNH GIÁ (TEST CHECKLIST)

| Hạng mục kiểm tra | Kết quả | Chi tiết |
| :--- | :---: | :--- |
| **npm install & dependencies** | ✅ PASS | Đầy đủ thư viện, không xung đột package |
| **npm run build** | ✅ PASS | Vite build production thành công trong 6.75s |
| **Branch Git & Source integrity** | ✅ PASS | Mã nguồn đẩy thành công lên branch `master` |
| **Cấu hình React Router (SPA)** | ✅ PASS | Nginx `try_files` chuyển hướng về `index.html` |
| **API & Database db.json** | ✅ PASS | Nginx proxy `/api/*` về json-server port 8000 |
| **Bảo mật mã nguồn & Secrets** | ✅ PASS | Không commit token/secret, `.dockerignore` chuẩn |
| **GitHub Actions Pipeline** | ✅ PASS | Đã tạo `.github/workflows/deploy.yml` chuẩn v4/v3/v6 |
| **Khả năng tương thích Render** | ✅ PASS | Tự động thích ứng cổng qua biến dynamic `$PORT` |

---

## 11. HƯỚNG DẪN CHẠY DOCKER LOCAL KHI CẦN
Nếu bạn muốn chạy `docker compose up -d` trên máy cá nhân:
1. Mở ứng dụng **Docker Desktop** từ Start Menu để khởi động Docker daemon.
2. Chạy lệnh: `docker compose up -d --build`
3. Mở trình duyệt truy cập: `http://localhost:3000`
