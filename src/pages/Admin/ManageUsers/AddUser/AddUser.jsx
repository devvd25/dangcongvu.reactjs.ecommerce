import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { adminAPI } from '../../../../api/adminApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const AddUser = ({ isOpen, onClose, fetchData }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Kiểm tra các trường bắt buộc
        if (!username || !email || !phone || !password) {
            Swal.fire({
                title: 'Lỗi!',
                text: 'Vui lòng điền tất cả các trường bắt buộc!',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            setLoading(false);
            return;
        }

        const newUser = {
            username,
            email,
            phone,
            password,
        };

        try {
            // Tạo người dùng mới
            await adminAPI.user.createUser(newUser);
            Swal.fire('Thành công!', 'Người dùng đã được thêm thành công.', 'success');
            fetchData(); // Tải lại dữ liệu
            onClose(); // Đóng modal
            // Reset state variables
            setUsername('');
            setEmail('');
            setPhone('');
            setPassword('');
        } catch (error) {
            console.error("Error adding user:", error);
            Swal.fire('Lỗi!', error.message || 'Có lỗi xảy ra khi thêm người dùng.', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
                <h2 className="text-xl font-bold mb-4">Thêm người dùng</h2>
                
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    onClick={onClose}
                >
                    <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
                </button>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Tên người dùng"
                            className="border rounded w-full p-2 focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            className="border rounded w-full p-2 focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Số điện thoại"
                            className="border rounded w-full p-2 focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mật khẩu"
                            className="border rounded w-full p-2 focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>
                    
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className={`px-3 py-2 text-base rounded-md bg-blue-500 text-white hover:bg-blue-600 font-semibold ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={loading}
                        >
                            {loading ? 'Đang thêm...' : 'Thêm người dùng'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUser;