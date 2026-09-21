import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { adminAPI } from '../../../../api/adminApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const EditUser = ({ isOpen, onClose, userData, fetchData }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userData) {
            setUsername(userData.username);
            setEmail(userData.email);
            setPhone(userData.phone);
        }
    }, [userData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const updatedUser = { username, email, phone };

        try {
            const response = await adminAPI.user.updateUser(userData.id, updatedUser);
            Swal.fire('Thành công!', 'Người dùng đã được cập nhật thành công.', 'success');
            fetchData();
            onClose();
        } catch (error) {
            console.error("Error updating user:", error);
            Swal.fire('Lỗi!', 'Có lỗi xảy ra khi cập nhật người dùng.', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
                <h2 className="text-xl font-bold mb-4">Chỉnh sửa người dùng</h2>
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
                            className="border rounded w-full p-2 focus:outline-none focus:border-yellow-500"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            className="border rounded w-full p-2 focus:outline-none focus:border-yellow-500"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Số điện thoại"
                            className="border rounded w-full p-2 focus:outline-none focus:border-yellow-500"
                            required
                        />
                    </div>
                    
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className={`px-3 py-2 text-base rounded-md bg-blue-500 text-white hover:bg-blue-600 font-semibold ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={loading}
                        >
                            {loading ? 'Đang cập nhật...' : 'Cập nhật người dùng'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUser;