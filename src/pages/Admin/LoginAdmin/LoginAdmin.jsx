import bgLogin from "../../../assets/Login/bgLogin.png"; // Import hình nền đăng nhập
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import icon từ FontAwesome
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons'; // Import các icon Email và Mật khẩu
import { Link, useNavigate } from "react-router-dom"; // Import Link và useNavigate từ react-router-dom để điều hướng trang
import { useState } from "react"; // Import hook useState để quản lý trạng thái trong component
import Swal from "sweetalert2"; // Import thư viện SweetAlert2 để hiển thị thông báo
import { setProfileToLS, setRoleTokenToLS } from "../../../utils/auth"; // Import hàm lưu thông tin người dùng vào localStorage
import path from "../../../constants/path"; // Import các đường dẫn trong ứng dụng
import { adminAPI } from "../../../api/adminApi"; // Import API quản lý người dùng của admin

// Định nghĩa component LoginAdmin
function LoginAdmin({ setUserRole }) {
    // Khởi tạo state formData với giá trị mặc định là một object rỗng
    const [formData, setFormData] = useState({ emailOrPhone: '', password: '' });
    // Khởi tạo state loading để quản lý trạng thái khi đăng nhập
    const [loading, setLoading] = useState(false);
    // Khởi tạo useNavigate để điều hướng trang sau khi đăng nhập thành công
    const navigate = useNavigate();

    // Hàm xử lý thay đổi giá trị input trong form
    const handleChange = (e) => {
        const { name, value } = e.target; // Lấy tên và giá trị của input
        setFormData({ ...formData, [name]: value }); // Cập nhật lại state formData với giá trị mới
    };

    // Hàm xử lý sự kiện khi người dùng gửi form (đăng nhập)
    const handleSubmit = async (e) => {
        e.preventDefault(); // Ngừng hành động mặc định khi gửi form (reload trang)
        setLoading(true); // Bật trạng thái loading khi bắt đầu đăng nhập

        const { emailOrPhone, password } = formData; // Lấy email/số điện thoại và mật khẩu từ state formData
        if (!emailOrPhone || !password) { // Kiểm tra nếu người dùng chưa nhập đầy đủ thông tin
            // Hiển thị thông báo cảnh báo nếu thông tin chưa đầy đủ
            Swal.fire({
                icon: "warning",
                title: "Vui lòng nhập đầy đủ thông tin",
                text: "Email hoặc số điện thoại và mật khẩu là bắt buộc!",
            });
            setLoading(false); // Tắt trạng thái loading khi thông báo hiển thị
            return; // Dừng hàm nếu có lỗi
        }

        try {
            // Gửi yêu cầu đăng nhập qua API với email/số điện thoại và mật khẩu
            const response = await adminAPI.user.login({ emailOrPhone, password });
            // Hiển thị thông báo đăng nhập thành công
            Swal.fire({
                icon: "success",
                title: "Đăng nhập thành công!",
                text: `Chào mừng ${response.data.username || "người dùng"}!`,
                showConfirmButton: false,
                timer: 2000, // Thông báo tự đóng sau 2 giây
            }).then(() => {
                // Lưu thông tin người dùng và vai trò vào localStorage
                setProfileToLS(response.data);
                setRoleTokenToLS(response.data.role);
                setUserRole(response.data.role); // Cập nhật vai trò người dùng trong state cha
                navigate(path.manageUser); // Điều hướng đến trang quản lý người dùng sau khi đăng nhập thành công
            });
        } catch (error) {
            // Nếu có lỗi khi đăng nhập, hiển thị thông báo lỗi
            Swal.fire({
                icon: "error",
                title: "Đăng nhập thất bại",
                text: error.message || "Đã có lỗi xảy ra. Vui lòng thử lại!",
            });
        } finally {
            setLoading(false); // Tắt trạng thái loading dù có thành công hay thất bại
        }
    };

    return (
        <>
            <div className="min-h-screen bg-blue-50">
                {/* Khung chứa nội dung trang đăng nhập */}
                <div className="container mx-auto px-4 lg:px-20 min-h-screen">
                    <div className="grid grid-cols-2 items-center gap-12 min-h-screen">
                        <div className="col-span-1 h-full flex items-center">
                            {/* Hiển thị hình nền đăng nhập */}
                            <img className="w-full h-auto" src={bgLogin} alt="Login Background" />
                        </div>
                        <div className="col-span-1">
                            <div className="rounded-xl shadow-custom p-5">
                              {/* Tiêu đề đăng nhập */}
                              <div className="text-center font-semibold text-xl">Đăng nhập</div>
                                {/* Form đăng nhập */}
                                <form onSubmit={handleSubmit}>
                                    <div className="mt-8">
                                        <div className="relative">
                                            {/* Hiển thị icon Email */}
                                            <FontAwesomeIcon icon={faEnvelope} className="absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-400" />
                                            <input
                                                className="border border-[#ccc] appearance-none rounded-lg w-full py-3 pl-10 pr-3 focus:outline-[#63aaed]"
                                                name="emailOrPhone"
                                                type="text"
                                                placeholder="Email hoặc số điện thoại"
                                                value={formData.emailOrPhone}
                                                onChange={handleChange}
                                                autoComplete="username"
                                                aria-label="Email hoặc số điện thoại"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <div className="relative">
                                            {/* Hiển thị icon Mật khẩu */}
                                            <FontAwesomeIcon icon={faLock} className="absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-400" />
                                            <input
                                                className="border border-[#ccc] appearance-none rounded-lg w-full py-3 pl-10 pr-3 focus:outline-[#63aaed]"
                                                name="password"
                                                type="password"
                                                placeholder="Mật khẩu"
                                                value={formData.password}
                                                onChange={handleChange}
                                                autoComplete="current-password"
                                                aria-label="Mật khẩu"
                                            />
                                        </div>
                                    </div>

                                    {/* Checkbox "Ghi nhớ mật khẩu" và liên kết "Quên mật khẩu?" */}
                                    <div className="flex items-center justify-between mt-8">
                                        <div className="flex items-center">
                                            <input
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded-lg"
                                                type="checkbox"
                                                id="remember"
                                            />
                                            <label className="ml-2 block text-gray-700" htmlFor="remember">
                                                Ghi nhớ mật khẩu
                                            </label>
                                        </div>
                                        <Link to="/forgot-password" className="text-blue-500 hover:text-blue-700">
                                            Quên mật khẩu?
                                        </Link>
                                    </div>

                                    {/* Nút đăng nhập */}
                                    <div className="flex justify-center mt-6">
                                        <button
                                            className="bg-[#63aaed] w-full hover:bg-[#4b96dd] font-inter text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline"
                                            type="submit"
                                            disabled={loading} // Vô hiệu hóa nút khi đang đăng nhập
                                        >
                                          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'} {/* Hiển thị trạng thái đăng nhập */}
                                        </button>
                                    </div>
                                    
                                    {/* Liên kết đến trang đăng ký nếu chưa có tài khoản */}
                                    <div className="mt-4 text-end font-inter text-sm">
                                        Chưa có tài khoản?
                                        <Link to="/register">
                                            <span className="text-[#63aaed] font-semibold hover:text-[#4b96dd] ms-1">Đăng ký ngay</span>
                                        </Link>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default LoginAdmin; // Xuất component LoginAdmin để sử dụng ở nơi khác
