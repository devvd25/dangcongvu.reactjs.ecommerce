import React, { useEffect, useState } from 'react';
import { userAPI } from '../../../api/userApi';
import { getProfileFromLS } from '../../../utils/auth';
import Swal from 'sweetalert2';
import { formatDateAndTime } from '../../../utils/utils';

function HistoryOrder() {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [productDetails, setProductDetails] = useState([]);
    const userId = getProfileFromLS().id;

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await userAPI.order.getOrdersByUserId(userId);
                setOrders(response);
            } catch (error) {
                console.error("Error fetching orders:", error);
                Swal.fire("Lỗi!", "Không thể tải lịch sử đơn hàng. Vui lòng thử lại.", "error");
            }
        };

        fetchOrders();
    }, [userId]);

    const handleViewDetails = async (order) => {
        setSelectedOrder(order);
        try {
            const products = await Promise.all(
                order.items.map(async (item) => {
                    const product = await userAPI.product.getById(item.productId);
                    return {
                        ...product.data,
                        quantity: item.quantity, // Include quantity in the product details
                    };
                })
            );
            setProductDetails(products);
        } catch (error) {
            console.error("Error fetching product details:", error);
            Swal.fire("Lỗi!", "Không thể tải thông tin sản phẩm. Vui lòng thử lại.", "error");
        }
    };

    const handleCloseModal = () => {
        setSelectedOrder(null);
        setProductDetails([]);
    };

    return (
        <div className="bg-[#f9fafb] min-h-screen">
            <div className="container mx-auto px-4 lg:px-20 py-6">
                <h2 className="text-xl font-semibold">Lịch sử đơn hàng</h2>
                {orders.length === 0 ? (
                    <div className="text-center mt-4">
                        <p className="text-gray-500">Bạn chưa có đơn hàng nào.</p>
                    </div>
                ) : (
                    <table className="min-w-full border-collapse border border-gray-300 mt-4 text-center">
                        <thead>
                            <tr className="bg-[#2a83e9] text-white rounded-t-[15px]">
                                <th className="border border-gray-300 p-2">Mã đơn hàng</th>
                                <th className="border border-gray-300 p-2">Tổng tiền</th>
                                <th className="border border-gray-300 p-2">Ngày đặt</th>
                                <th className="border border-gray-300 p-2">Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id} className="hover:bg-gray-100">
                                    <td className="border border-gray-300 p-2">#{order.id}</td>
                                    <td className="border border-gray-300 p-2">{order.totalPrice.toLocaleString()} ₫</td>
                                    <td className="border border-gray-300 p-2">{formatDateAndTime(order.orderTime)}</td>
                                    <td className="border border-gray-300 p-2">
                                        <button className="text-blue-500 hover:underline" onClick={() => handleViewDetails(order)}>
                                            Xem chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal hiển thị chi tiết đơn hàng */}
            {selectedOrder && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full">
                        <h3 className="text-lg font-semibold">Chi tiết đơn hàng</h3>
                        <div className="mt-4">
                            <h4 className="font-semibold">Thông tin người nhận:</h4>
                            <p>Họ tên: {selectedOrder.name}</p>
                            <p>Địa chỉ: {selectedOrder.address}</p>
                            <p>Điện thoại: {selectedOrder.phone}</p>
                        </div>
                        <div className="mt-4">
                            <h4 className="font-semibold">Sản phẩm:</h4>
                            {productDetails.map(product => (
                                <div key={product.id} className="grid grid-cols-5 gap-4 items-start border rounded-xl p-2 mt-3">
                                    <img className="col-span-1 w-full h-auto object-cover" src={product.images[0]?.url} alt={product.name} />
                                    <div className="col-span-3">
                                        <div className="font-semibold text-base line-clamp-1">{product.name}</div>
                                        <div className="font-semibold text-xs mt-1 line-clamp-2">
                                            Mô tả: <span className="text-[#344054] font-light">{product.description}</span>
                                        </div>
                                        <div className="font-semibold text-xs mt-1 line-clamp-2">
                                            Số lượng: <span className="text-[#344054] font-light">{product.quantity}</span>
                                        </div>
                                    </div>
                                    <div className="col-span-1 text-[#dd2f2c] text-xl font-semibold">{product.discountPrice.toLocaleString()} ₫</div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button 
                                className="bg-blue-500 text-white px-4 py-2 rounded"
                                onClick={handleCloseModal}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HistoryOrder;