import Footer from "../../../components/Footer/Footer";
import Header from "../../../components/Header/Header";
import Navbar from "../../../components/Navbar/Navbar";
import bgLogin from "../../../assets/Login/bgLogin.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Swal from "sweetalert2";
import { userAPI } from "../../../api/userApi";
import { setProfileToLS, setRoleTokenToLS } from "../../../utils/auth";
import path from "../../../constants/path";
function Login({ setUserRole }) {
    const [formData, setFormData] = useState({ emailOrPhone: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate()
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
  
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
  
        const { emailOrPhone, password } = formData;
        if (!emailOrPhone || !password) {
            Swal.fire({
                icon: "warning",
                title: "Vui lòng nhập đầy đủ thông tin",
                text: "Email hoặc số điện thoại và mật khẩu là bắt buộc!",
            });
            setLoading(false);
            return;
        }
  
        try {
            const response = await userAPI.login({ emailOrPhone, password });
            Swal.fire({
                icon: "success",
                title: "Đăng nhập thành công!",
                text: `Chào mừng ${response.data.username || "người dùng"}!`,
                showConfirmButton: false,
                timer: 2000,
            }).then(()=>{
              setProfileToLS(response.data)
              setRoleTokenToLS(response.data.role)
              setUserRole(response.data.role)
              navigate(path.home)
            });
            // Thực hiện các hành động sau khi đăng nhập thành công ở đây
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Đăng nhập thất bại",
                text: error.message || "Đã có lỗi xảy ra. Vui lòng thử lại!",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="min-h-screen bg-blue-50">
                {/* <Header />
                <Navbar /> */}
                <div className="container mx-auto px-4 lg:px-20 min-h-screen">
                    <div className="grid grid-cols-2 items-center gap-12 min-h-screen">
                        <div className="col-span-1 h-full flex items-center">
                            <img className="w-full h-auto" src={bgLogin} alt="Login Background" />
                        </div>
                        <div className="col-span-1">
                            <div className="rounded-xl shadow-custom p-5">
                              <div className="text-center font-semibold text-xl">Đăng nhập</div>
                                <form onSubmit={handleSubmit}>
                                    <div className="mt-8">
                                        <div className="relative">
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

                                    <div className="flex justify-center mt-6">
                                        <button
                                            className="bg-[#63aaed] w-full hover:bg-[#4b96dd] font-inter text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline"
                                            type="submit"
                                            disabled={loading}
                                        >
                                          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                                        </button>
                                    </div>
                                    
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
            {/* <Footer /> */}
        </>
    );
}

export default Login;
