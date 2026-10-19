# 📘 HƯỚNG DẪN ĐĂNG KÝ VÀ TRIỂN KHAI AWS CLOUD EC2 VPS (TỪ A ĐẾN Z)
> **Dự Án:** Thương Mại Điện Tử Nhóm 10 - ST23D - Đại Học Đông Á  
> **Hạ Tầng:** AWS EC2 (Singapore) + Docker + Nginx + TiDB Cloud MySQL + Jenkins CI/CD  
> **Địa Chỉ Web:** `https://13.212.197.81.sslip.io` (SSL HTTPS Let's Encrypt 🔒)

---

## 📑 MỤC LỤC
1. [Chuẩn bị trước khi đăng ký AWS](#1-chuẩn-bị-trước-khi-đăng-ký-aws)
2. [Các bước đăng ký tài khoản AWS Free Tier (12 tháng miễn phí)](#2-các-bước-đăng-ký-tài-khoản-aws-free-tier-12-tháng-miễn-phí)
3. [Khởi tạo máy chủ ảo EC2 VPS (Chuẩn Free Tier)](#3-khởi-tạo-máy-chủ-ảo-ec2-vps-chuẩn-free-tier)
4. [Cấu hình tường lửa Security Group (Mở Port Web)](#4-cấu-hình-tường-lửa-security-group-mở-port-web)
5. [Kết nối vào máy chủ VPS qua SSH](#5-kết-nối-vào-máy-chủ-vps-qua-ssh)
6. [Thiết lập môi trường trên VPS (Swap RAM & Docker)](#6-thiết-lập-môi-trường-trên-vps-swap-ram--docker)
7. [Triển khai hệ thống bằng Docker Compose](#7-triển-khai-hệ-thống-bằng-docker-compose)
8. [Cấp chứng chỉ SSL/TLS HTTPS (Ổ khóa xanh 🔒 qua sslip.io)](#8-cấp-chứng-chỉ-ssltls-https-ổ-khóa-xanh--qua-sslipio)
9. [Tích hợp tự động hóa vào Jenkins CI/CD](#9-tích-hợp-tự-động-hóa-vào-jenkins-cicd)
10. [Checklist kiểm tra và hướng dẫn bảo vệ đồ án](#10-checklist-kiểm-tra-và-hướng-dẫn-bảo-vệ-đồ-án)

---

## 1. CHUẨN BỊ TRƯỚC KHI ĐĂNG KÝ AWS
Trước khi đăng ký, cần chuẩn bị sẵn:
1. **1 Thẻ Visa hoặc Mastercard** (Thẻ Debit hoặc Credit đều được):
   - Trong thẻ có tối thiểu khoảng **25.000đ - 50.000đ (1$ - 2$)** để AWS gửi lệnh xác thực thẻ (sau đó tiền sẽ được hoàn trả tự động).
   - Đã kích hoạt tính năng thanh toán quốc tế / thanh toán online.
2. **1 Email cá nhân** (chưa từng đăng ký tài khoản AWS bao giờ).
3. **1 Số điện thoại di động** để nhận mã xác minh OTP qua tin nhắn SMS.

---

## 2. CÁC BƯỚC ĐĂNG KÝ TÀI KHOẢN AWS FREE TIER
* **Bước 1:** Mở tab ẩn danh trình duyệt (`Ctrl + Shift + N`), truy cập: [https://portal.aws.amazon.com/billing/signup](https://portal.aws.amazon.com/billing/signup)
* **Bước 2 (Root User):**
  - Nhập **Email**.
  - **AWS account name:** Đặt tên tài khoản gợi nhớ (ví dụ: `devvd25`).
  - Bấm **Verify email address** ➔ Lấy mã 6 số từ hòm thư dán vào xác thực.
* **Bước 3 (Mật khẩu):** Đặt mật khẩu Root User (tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt).
* **Bước 4 (Thông tin cá nhân):**
  - Chọn **Personal** (Dành cho cá nhân / sinh viên).
  - Điền Họ tên không dấu (ví dụ: `DANG CONG VU`).
  - Chọn Quốc gia: **Vietnam** (`+84`). Nhập số điện thoại (bỏ số 0 ở đầu).
  - Địa chỉ: Gõ địa chỉ nơi ở, Tỉnh/Thành phố (`Da Nang`).
  - Mã bưu chính (Postal code): Đà Nẵng là `550000`, Hà Nội `100000`, TP.HCM `700000`.
* **Bước 5 (Thông tin thẻ thanh toán):**
  - Nhập 16 số thẻ, Ngày hết hạn (Tháng/Năm) và Mã CVV (3 số mặt sau thẻ).
  - Tên chủ thẻ in hoa không dấu.
* **Bước 6 (Xác thực SMS):** Nhận 4 chữ số OTP qua tin nhắn điện thoại để kích hoạt.
* **Bước 7 (Chọn gói hỗ trợ - Cực kỳ quan trọng):**
  - Chọn: **Basic Support - Free** *(Miễn phí 100%)*. Tuyệt đối không chọn gói trả phí.
* **Bước 8:** Bấm **Complete sign up** và đăng nhập vào **AWS Management Console**.

---

## 3. KHỞI TẠO MÁY CHỦ ẢO EC2 VPS (CHUẨN FREE TIER)
1. Đăng nhập vào [AWS Console](https://console.aws.amazon.com/), nhìn góc trên bên phải chọn Region: **Asia Pacific (Singapore) `ap-southeast-1`** (để có tốc độ mạng nhanh nhất về Việt Nam).
2. Vào dịch vụ **EC2** ➔ Bấm nút màu cam: **Launch instance**.
3. Cấu hình đúng chuẩn các thông số kỹ thuật sau:

| Mục cấu hình | Giá trị thiết lập | Ghi chú |
| :--- | :--- | :--- |
| **Name** | `DevOps-ST23D-2026` | Tên gợi nhớ máy chủ |
| **OS Images (AMI)** | **Ubuntu Server 24.04/26.04 LTS (HVM)** | Có nhãn **Free tier eligible** |
| **Architecture** | `64-bit (x86)` | Mặc định |
| **Instance type** | **`t3.micro`** (hoặc `t2.micro`) | Có nhãn **Free tier eligible** (2 vCPU, 1GB RAM) |
| **Key pair (login)** | Bấm **Create new key pair**: <br>- Tên: `DevOps-ST23D-2026-KEY`<br>- Loại: `RSA`<br>- Định dạng: **`.pem`** | Tải file `.pem` về máy tính và lưu giữ cẩn thận |
| **Network settings** | Tích chọn: <br>☑ Allow SSH traffic from Anywhere (`0.0.0.0/0`)<br>☑ Allow HTTP traffic from the internet<br>☑ Allow HTTPS traffic from the internet | Cho phép mở cổng mạng từ ngoài |
| **Configure storage** | **`20 GiB gp3`** | Miễn phí tối đa tới 30GB, chọn 20GB chạy Docker thoải mái |

4. Bấm nút màu cam: **Launch instance**.  
5. Đợi 10 giây hệ thống tạo xong, ghi lại **Public IPv4 address** (ví dụ: `13.212.197.81`).

---

## 4. CẤU HÌNH TƯỜNG LỬA SECURITY GROUP (MỞ PORT WEB)
Để website truy cập được các dịch vụ API và cổng dự phòng:
1. Tại trang chi tiết máy chủ EC2, bấm tab **Security** ➔ Bấm vào tên Security Group (dạng `launch-wizard-1`).
2. Bấm nút **Edit inbound rules** ➔ Bấm **Add rule** thêm 2 dòng:
   - **Cổng 3000:** Type: `Custom TCP` | Port: `3000` | Source: `Anywhere-IPv4 (0.0.0.0/0)`
   - **Cổng 5000:** Type: `Custom TCP` | Port: `5000` | Source: `Anywhere-IPv4 (0.0.0.0/0)`
3. Bấm **Save rules**.

---

## 5. KẾT NỐI VÀO MÁY CHỦ VPS QUA SSH

### Cách 1: Kết nối bằng Web Console (Không cần cài đặt)
* Trên trang EC2 Console, chọn máy chủ ➔ Bấm nút **Connect** (trên cùng) ➔ Giữ nguyên tab **EC2 Instance Connect** ➔ Bấm **Connect**. Cửa sổ Terminal Linux sẽ hiện ra ngay trên trình duyệt.

### Cách 2: Kết nối từ máy tính qua Terminal / PowerShell
1. **Xử lý quyền bảo mật file `.pem` trên Windows (Tránh lỗi UNPROTECTED PRIVATE KEY):**
   Mở PowerShell tại thư mục chứa file `.pem` và chạy:
   ```powershell
   icacls DevOps-ST23D-2026-KEY.pem /inheritance:d
   icacls DevOps-ST23D-2026-KEY.pem /remove "NT AUTHORITY\Authenticated Users"
   icacls DevOps-ST23D-2026-KEY.pem /remove "BUILTIN\Users"
   icacls DevOps-ST23D-2026-KEY.pem /remove "BUILTIN\Administrators"
   icacls DevOps-ST23D-2026-KEY.pem /remove "NT AUTHORITY\SYSTEM"
   ```
2. **Gõ lệnh kết nối SSH:**
   ```bash
   ssh -i "DevOps-ST23D-2026-KEY.pem" -o StrictHostKeyChecking=no ubuntu@13.212.197.81
   ```

---

## 6. THIẾT LẬP MÔI TRƯỜNG TRÊN VPS (SWAP RAM & DOCKER)
Khi đã vào bên trong Terminal của VPS (`ubuntu@ip-...:~$`), chạy khối lệnh sau:

```bash
# 1. Tạo 2GB RAM ảo (Swap) chống tràn bộ nhớ cho gói t3.micro (1GB RAM)
sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 2. Cài đặt Docker & Docker Compose Plugin mới nhất
sudo apt-get update -y
sudo apt-get install -y docker.io docker-compose-v2 curl
sudo systemctl enable --now docker
sudo usermod -aG docker ubuntu
```

---

## 7. TRIỂN KHAI HỆ THỐNG BẰNG DOCKER COMPOSE
Tạo thư mục ứng dụng và file cấu hình điều phối các container:

```bash
mkdir -p ~/ecommerce-deploy && cd ~/ecommerce-deploy

cat << 'EOF' > docker-compose.yml
services:
  backend:
    image: devvd25/ecommerce-backend:latest
    container_name: ecommerce-backend
    restart: always
    ports:
      - "127.0.0.1:5000:5000"
    environment:
      - PORT=5000
      - NODE_ENV=production
      - DATABASE_URL=mysql://aWGBHVK8cRFiXoU.root:Ebdx3sdNLsj8BJ00@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/ecommerce_db

  frontend:
    image: devvd25/ecommerce-frontend:latest
    container_name: ecommerce-frontend
    restart: always
    ports:
      - "127.0.0.1:3000:80"
    environment:
      - PORT=80
      - BACKEND_URL=http://backend:5000/api/
    depends_on:
      - backend
EOF

# Kéo Docker Image mới nhất và khởi động
sudo docker compose pull
sudo docker compose up -d
```

---

## 8. CẤP CHỨNG CHỈ SSL/TLS HTTPS (Ổ KHÓA XANH 🔒 QUA SSLIP.IO)

### Bản chất của `sslip.io`:
Let's Encrypt không cấp SSL cho IP số trần (`13.212.197.81`). Dịch vụ Wildcard DNS **`sslip.io`** tự động phân giải domain `13.212.197.81.sslip.io` về chính IP máy chủ `13.212.197.81` hoàn toàn miễn phí và hợp lệ chuẩn quốc tế.

### Các bước cài đặt HTTPS trên VPS:
```bash
# 1. Cài đặt Nginx và Certbot trên hệ điều hành host
sudo apt-get install -y certbot python3-certbot-nginx nginx

# 2. Dừng Nginx tạm thời và đăng ký chứng chỉ SSL Let's Encrypt
sudo systemctl stop nginx || true
sudo certbot certonly --standalone -d 13.212.197.81.sslip.io --non-interactive --agree-tos -m devvd25@gmail.com

# 3. Tạo cấu hình Nginx Reverse Proxy chuyển hướng HTTP sang HTTPS
cat << 'EOF' | sudo tee /etc/nginx/sites-available/ecommerce
server {
    listen 80;
    server_name 13.212.197.81.sslip.io 13.212.197.81;
    return 301 https://13.212.197.81.sslip.io$request_uri;
}

server {
    listen 443 ssl;
    server_name 13.212.197.81.sslip.io;

    ssl_certificate /etc/letsencrypt/live/13.212.197.81.sslip.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/13.212.197.81.sslip.io/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
EOF

# 4. Kích hoạt cấu hình và khởi động lại Nginx
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```
👉 Sau bước này, truy cập **`https://13.212.197.81.sslip.io`** sẽ có ngay **ổ khóa bảo mật HTTPS 🔒**.

---

## 9. TÍCH HỢP TỰ ĐỘNG HÓA VÀO JENKINS CI/CD
Theo đúng sơ đồ thầy giáo yêu cầu, sau khi Jenkins kiểm thử và đẩy Docker image lên Docker Hub, Jenkins sẽ tự động **gửi lệnh qua SSH** vào AWS VPS:

### 1. Đưa file chìa khóa vào Jenkins:
Copy file `DevOps-ST23D-2026-KEY.pem` vào thư mục `jenkins_home` của Jenkins trên máy tính:
```powershell
Copy-Item "DevOps-ST23D-2026-KEY.pem" "jenkins_home\DevOps-ST23D-2026-KEY.pem" -Force
```

### 2. Kịch bản Stage Deploy trong `Jenkinsfile`:
```groovy
stage('5. Triển Khai (Deploy to Cloud VPS)') {
    steps {
        sh '''
            KEY_FILE="/var/jenkins_home/DevOps-ST23D-2026-KEY.pem"
            chmod 600 "$KEY_FILE"
            
            echo "📡 Đang kết nối SSH vào máy chủ ubuntu@13.212.197.81..."
            ssh -o StrictHostKeyChecking=no -i "$KEY_FILE" ubuntu@13.212.197.81 """
                cd ~/ecommerce-deploy
                sudo docker compose pull
                sudo docker compose up -d
                sudo docker image prune -f || true
            """
            
            echo "🩺 Kiểm tra sức khỏe hệ thống qua HTTPS..."
            curl -k -s "https://13.212.197.81.sslip.io/api/health"
            echo "🎉 [THÀNH CÔNG] Triển khai lên AWS Cloud VPS hoàn tất!"
        '''
    }
}
```

---

## 10. CHECKLIST KIỂM TRA VÀ HƯỚNG DẪN BẢO VỆ ĐỒ ÁN

### 1. Khi bật laptop ở trường để báo cáo:
- [ ] **Mở Docker Desktop** ➔ Đợi chữ xanh `Engine running`.
- [ ] **Khởi động Jenkins**: Nháy đúp file `start-jenkins.bat`.
- [ ] *(Tùy chọn)* Nháy đúp file `bat-ngrok-webhook.bat` nếu muốn demo webhook.
- [ ] Mở sẵn 3 Tab trình duyệt:
  1. **Website Live AWS:** `https://13.212.197.81.sslip.io`
  2. **Bảng điều khiển Jenkins:** `http://localhost:8080`
  3. **Kho mã nguồn GitHub:** `https://github.com/devvd25/dangcongvu.reactjs.ecommerce`

### 2. Kịch bản biểu diễn thực chiến cho thầy xem:
1. Sửa 1 chữ trong file `src/components/Header/Header.jsx`.
2. Gõ lệnh:
   ```bash
   git add .
   git commit -m "demo: cap nhat giao dien"
   git push origin master
   ```
3. Mở Jenkins bấm **Build Now** ➔ Cho thầy xem 5 Stage chạy xanh mượt mà kèm log Tiếng Việt chi tiết.
4. Mở tab website `https://13.212.197.81.sslip.io` ➔ Giao diện tự động cập nhật ngay lập tức!
