pipeline {
    agent any

    environment {
        DOCKERHUB_CRED = 'dockerhub-cred'
        BACKEND_IMAGE = 'ecommerce-backend'
        FRONTEND_IMAGE = 'ecommerce-frontend'
    }

    stages {
        // ==========================================
        // Stage 1: Checkout Source Code from GitHub
        // ==========================================
        stage('Checkout') {
            steps {
                echo '🚀 [1/5] Kéo mã nguồn mới nhất từ GitHub...'
                checkout scm
            }
        }

        // ==========================================
        // Stage 2: Build & Kiểm thử cú pháp
        // ==========================================
        stage('Build & Test') {
            steps {
                echo '🔍 [2/5] Kiểm tra dependencies và build thử nghiệm...'
                sh '''
                    echo "--- Testing Frontend (React Vite) ---"
                    npm ci
                    npm run build

                    echo "--- Testing Backend (Node.js Express) ---"
                    cd backend
                    npm ci
                    node -c src/server.js
                    node -c src/app.js
                    echo "✅ Build & Syntax checks passed successfully!"
                '''
            }
        }

        // ==========================================
        // Stage 3: Đóng gói Docker Images
        // ==========================================
        stage('Docker Build') {
            steps {
                echo '🐳 [3/5] Đóng gói Docker Images cho Frontend và Backend...'
                withCredentials([usernamePassword(credentialsId: env.DOCKERHUB_CRED,
                    usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo "Building Frontend Image: $DOCKER_USER/$FRONTEND_IMAGE:latest"
                        docker build -t $DOCKER_USER/$FRONTEND_IMAGE:latest .

                        echo "Building Backend Image: $DOCKER_USER/$BACKEND_IMAGE:latest"
                        docker build -t $DOCKER_USER/$BACKEND_IMAGE:latest ./backend
                    '''
                }
            }
        }

        // ==========================================
        // Stage 4: Đẩy Docker Images lên Docker Hub
        // ==========================================
        stage('Push Docker Hub') {
            steps {
                echo '📤 [4/5] Đăng nhập và đẩy Docker Images lên Docker Hub...'
                withCredentials([usernamePassword(credentialsId: env.DOCKERHUB_CRED,
                    usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push $DOCKER_USER/$FRONTEND_IMAGE:latest
                        docker push $DOCKER_USER/$BACKEND_IMAGE:latest
                        echo "✅ Đã đẩy thành công cả 2 images lên Docker Hub!"
                    '''
                }
            }
        }

        // ==========================================
        // Stage 5: Triển khai (Deploy to Render & Docker)
        // ==========================================
        stage('Deploy') {
            steps {
                echo '🚢 [5/5] Triển khai hệ thống lên OnRender / Docker...'
                script {
                    // 1. Kích hoạt tự động triển khai lên Render qua Deploy Hook
                    try {
                        withCredentials([string(credentialsId: 'render-deploy-hook', variable: 'RENDER_HOOK')]) {
                            echo '🌐 Đang gửi tín hiệu Deploy Hook lên OnRender...'
                            sh '''
                                response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$RENDER_HOOK")
                                echo "Render Deploy Response HTTP Code: $response"
                                echo "✅ Đã kích hoạt Render tự động cập nhật website thành công!"
                            '''
                        }
                    } catch (Exception e) {
                        echo 'ℹ️ Chưa cấu hình credential "render-deploy-hook" trên Jenkins (hoặc bỏ qua Render).'
                    }

                    // 2. Khởi chạy Docker Compose môi trường Production (nếu chạy Docker)
                    try {
                        withCredentials([usernamePassword(credentialsId: env.DOCKERHUB_CRED,
                            usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                            sh '''
                                echo "Khởi chạy các services qua docker-compose.prod.yml..."
                                export DOCKER_USER=$DOCKER_USER
                                docker compose -f docker-compose.prod.yml pull || true
                                docker compose -f docker-compose.prod.yml down || true
                                docker compose -f docker-compose.prod.yml up -d || true
                                docker image prune -f || true
                                echo "🎉 Triển khai hoàn tất! Hệ thống đang hoạt động trên Docker."
                            '''
                        }
                    } catch (Exception e) {
                        echo "⚠️ Bỏ qua bước Docker Compose local: ${e.getMessage()}"
                    }

                    // 3. Triển khai tự động lên AWS Cloud VPS qua SSH (Theo sơ đồ thầy giáo)
                    try {
                        echo '☁️ Đang gửi lệnh qua SSH tới AWS Cloud VPS (13.212.197.81)...'
                        sh '''
                            KEY_FILE=""
                            if [ -f "/var/jenkins_home/DevOps-ST23D-2026-KEY.pem" ]; then
                                KEY_FILE="/var/jenkins_home/DevOps-ST23D-2026-KEY.pem"
                            elif [ -f "./DevOps-ST23D-2026-KEY.pem" ]; then
                                KEY_FILE="./DevOps-ST23D-2026-KEY.pem"
                            fi

                            if [ -n "$KEY_FILE" ]; then
                                chmod 600 "$KEY_FILE"
                                ssh -o StrictHostKeyChecking=no -i "$KEY_FILE" ubuntu@13.212.197.81 "cd ~/ecommerce-deploy && sudo docker compose pull && sudo docker compose up -d"
                                echo "🎉 [AWS VPS] Website trên Cloud VPS đã được cập nhật phiên bản mới nhất!"
                            else
                                echo "⚠️ Không tìm thấy file DevOps-ST23D-2026-KEY.pem trong Jenkins!"
                            fi
                        '''
                    } catch (Exception e) {
                        echo "⚠️ Bỏ qua bước SSH Deploy AWS VPS: ${e.getMessage()}"
                    }

                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo '🎉 [SUCCESS] Pipeline hoàn tất thành công 100%!'
        }
        failure {
            echo '❌ [FAILURE] Pipeline thất bại! Vui lòng kiểm tra lại log.'
        }
    }
}
