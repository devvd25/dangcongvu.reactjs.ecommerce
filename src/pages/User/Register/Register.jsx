import Footer from "../../../components/Footer/Footer";
import Header from "../../../components/Header/Header";
import Navbar from "../../../components/Navbar/Navbar";
import bgLogin from "../../../assets/Login/bgLogin.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faUser, faPhone } from '@fortawesome/free-solid-svg-icons';
import { Link } from "react-router-dom";
import { useState } from "react";
import Swal from "sweetalert2";
import { userAPI } from "../../../api/userApi";

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const checkUniqueEmailAndPhone = async (email, phone) => {
    try {
      const emailExists = await userAPI.checkEmailExists(email); // Check if email exists
      if (emailExists.exists) {
        Swal.fire({
          icon: "warning",
          title: "Email đã được sử dụng",
          text: "Vui lòng sử dụng email khác.",
        });
        return false;
      }

      const phoneExists = await userAPI.checkPhoneExists(phone); // Check if phone exists
      if (phoneExists.exists) {
        Swal.fire({
          icon: "warning",
          title: "Số điện thoại đã được sử dụng",
          text: "Vui lòng sử dụng số điện thoại khác.",
        });
        return false;
      }

      return true;
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Lỗi khi kiểm tra thông tin",
        text: "Đã có lỗi xảy ra. Vui lòng thử lại!",
      });
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { email, password, phone, username } = formData;
    if (!email || !password || !phone || !username) {
      Swal.fire({
        icon: "warning",
        title: "Vui lòng nhập đầy đủ thông tin",
        text: "Tất cả các trường là bắt buộc!",
      });
      setLoading(false);
      return;
    }

    // Check for unique email and phone
    const isUnique = await checkUniqueEmailAndPhone(email, phone);
    if (!isUnique) {
      setLoading(false);
      return;
    }

    try {
      const response = await userAPI.register({ email, password, phone, username });
      Swal.fire({
        icon: "success",
        title: "Đăng ký thành công!",
        text: "Tài khoản của bạn đã được tạo. Vui lòng đăng nhập để tiếp tục.",
        showConfirmButton: false,
        timer: 3000,
      }).then(()=>{
        setFormData({
          email: '',
          password: '',
          username: '',
          phone: ''
        })
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Đăng ký thất bại",
        text: error.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại!",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-blue-50">
       
        <div className="container mx-auto px-4 lg:px-20 min-h-screen">
          <div className="grid grid-cols-2 items-center gap-12 min-h-screen">
            <div className="col-span-1 h-full flex items-center">
              <img className="w-full h-auto" src={bgLogin} alt="Register Background" />
            </div>
            <div className="col-span-1">
              <div className="rounded-xl shadow-custom p-5">
              <div className="text-center font-semibold text-xl">Đăng ký</div>

                <form onSubmit={handleSubmit}>
                  <div className="mt-8">
                    <div className="relative">
                      <FontAwesomeIcon icon={faUser} className="absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-400" />
                      <input
                        className="border border-[#ccc] appearance-none rounded-lg w-full py-3 pl-10 pr-3 focus:outline-[#63aaed]"
                        name="username"
                        type="text"
                        placeholder="Tên người dùng"
                        value={formData.username}
                        onChange={handleChange}
                        autoComplete="username"
                        aria-label="Username"
                      />
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="relative">
                      <FontAwesomeIcon icon={faPhone} className="absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-400" />
                      <input
                        className="border border-[#ccc] appearance-none rounded-lg w-full py-3 pl-10 pr-3 focus:outline-[#63aaed]"
                        name="phone"
                        type="tel"
                        placeholder="Số điện thoại"
                        value={formData.phone}
                        onChange={handleChange}
                        autoComplete="tel"
                        aria-label="Phone"
                      />
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="relative">
                      <FontAwesomeIcon icon={faEnvelope} className="absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-400" />
                      <input
                        className="border border-[#ccc] appearance-none rounded-lg w-full py-3 pl-10 pr-3 focus:outline-[#63aaed]"
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="email"
                        aria-label="Email"
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
                        aria-label="Password"
                      />
                    </div>
                  </div>

                  <div className="flex justify-center mt-6">
                    <button
                      className="bg-[#63aaed] w-full hover:bg-[#4b96dd] font-inter text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                    </button>
                  </div>
                  
                  <div className="mt-4 text-end font-inter text-sm">
                    Đã có tài khoản?
                    <Link to="/login">
                      <span className="text-[#63aaed] font-semibold hover:text-[#4b96dd] ms-1">Đăng nhập</span>
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

export default Register;
