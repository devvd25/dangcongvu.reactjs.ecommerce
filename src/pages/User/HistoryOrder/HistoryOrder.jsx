import React, { useEffect, useMemo, useState } from 'react';
import { userAPI } from '../../../api/userApi';
import { getProfileFromLS } from '../../../utils/auth';
import Swal from 'sweetalert2';
import { formatDateAndTime } from '../../../utils/utils';
import { ORDER_STATUS, ORDER_TABS, CANCEL_REASONS } from '../../../constants/orderStatus';
import OrderTimeline from '../../../components/OrderTimeline/OrderTimeline';

const formatPrice = (value) => `${Number(value || 0).toLocaleString("vi-VN")} ₫`;

function HistoryOrder() {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [activeTab, setActiveTab] = useState("all");
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [loading, setLoading] = useState(true);
    const userId = getProfileFromLS().id;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [orderList, productResponse] = await Promise.all([
                    userAPI.order.getOrdersByUserId(userId),
                    userAPI.product.getAll(),
                ]);
                setOrders(orderList);
                setProducts(productResponse.data);
            } catch (error) {
                console.error("Error fetching orders:", error);
                Swal.fire("Lỗi!", "Không thể tải lịch sử đơn hàng. Vui lòng thử lại.", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    const findProduct = (productId) => products.find((p) => String(p.id) === String(productId));

    const countByStatus = useMemo(() => {
        return orders.reduce((counts, order) => {
            counts[order.status] = (counts[order.status] || 0) + 1;
            return counts;
        }, {});
    }, [orders]);

    const visibleOrders = activeTab === "all" ? orders : orders.filter((order) => order.status === activeTab);
    const selectedOrder = orders.find((order) => order.id === selectedOrderId);

    const changeStatus = async (order, status, note) => {
        try {
            const response = await userAPI.order.updateStatus(order.id, status, note);
            setOrders((prev) => prev.map((o) => (o.id === order.id ? response.data : o)));
            return true;
        } catch (error) {
            console.error("Error updating order status:", error);
            Swal.fire("Lỗi!", error.response?.data?.message || "Không thể cập nhật đơn hàng. Vui lòng thử lại.", "error");
            return false;
        }
    };

    const handleCancelOrder = async (order) => {
        const { value: reason } = await Swal.fire({
            title: `Huỷ đơn hàng #${order.id}?`,
            text: "Vui lòng chọn lý do huỷ đơn",
            input: "select",
            inputOptions: Object.fromEntries(CANCEL_REASONS.map((r) => [r, r])),
            inputPlaceholder: "-- Chọn lý do --",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Huỷ đơn hàng",
            cancelButtonText: "Không",
            inputValidator: (value) => !value && "Vui lòng chọn lý do huỷ đơn",
        });
        if (!reason) return;

        if (await changeStatus(order, "cancelled", reason)) {
            Swal.fire("Đã huỷ!", "Đơn hàng của bạn đã được huỷ.", "success");
        }
    };

    const handleConfirmReceived = async (order) => {
        const result = await Swal.fire({
            title: "Bạn đã nhận được hàng?",
            text: "Chỉ xác nhận khi bạn đã nhận được sản phẩm và không có vấn đề gì.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Đã nhận được hàng",
            cancelButtonText: "Chưa",
        });
        if (!result.isConfirmed) return;

        if (await changeStatus(order, "delivered", "Người mua đã xác nhận nhận hàng")) {
            Swal.fire("Cảm ơn bạn!", "Đơn hàng đã được giao thành công.", "success");
        }
    };

    const renderActions = (order) => (
        <>
            {order.status === "pending" && (
                <button
                    className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                    onClick={() => handleCancelOrder(order)}
                >
                    Huỷ đơn hàng
                </button>
            )}
            {order.status === "shipping" && (
                <button
                    className="px-4 py-2 rounded bg-[#2a83e9] text-white hover:bg-[#1f6fca]"
                    onClick={() => handleConfirmReceived(order)}
                >
                    Đã nhận được hàng
                </button>
            )}
        </>
    );

    return (
        <div className="bg-[#f5f5f5] min-h-screen">
            <div className="container mx-auto px-4 lg:px-20 py-6">
                <h2 className="text-xl font-semibold">Đơn mua</h2>

                {/* Tabs trạng thái đơn hàng */}
                <div className="mt-4 bg-white flex overflow-x-auto rounded-t-md shadow-sm">
                    {ORDER_TABS.map((tab) => {
                        const count = tab.key === "all" ? orders.length : countByStatus[tab.key] || 0;
                        const active = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex-1 min-w-[120px] py-3 text-sm font-medium border-b-2 whitespace-nowrap ${active ? "border-[#2a83e9] text-[#2a83e9]" : "border-transparent text-gray-700 hover:text-[#2a83e9]"}`}
                            >
                                {tab.label}{count > 0 && ` (${count})`}
                            </button>
                        );
                    })}
                </div>

                {loading ? (
                    <div className="text-center text-gray-500 bg-white py-16 mt-3">Đang tải đơn hàng...</div>
                ) : visibleOrders.length === 0 ? (
                    <div className="text-center text-gray-500 bg-white py-16 mt-3">Chưa có đơn hàng</div>
                ) : (
                    visibleOrders.map((order) => (
                        <div key={order.id} className="bg-white mt-3 rounded-md shadow-sm">
                            <div className="flex justify-between items-center px-5 py-3 border-b">
                                <div className="text-sm text-gray-600">
                                    Mã đơn <span className="font-semibold text-gray-800">#{order.id}</span>
                                    <span className="mx-2">|</span>
                                    {formatDateAndTime(order.orderTime)}
                                </div>
                                <span className={`text-xs font-semibold uppercase px-3 py-1 rounded-full ${ORDER_STATUS[order.status]?.badge}`}>
                                    {ORDER_STATUS[order.status]?.label}
                                </span>
                            </div>

                            <div className="px-5 cursor-pointer" onClick={() => setSelectedOrderId(order.id)}>
                                {order.items.map((item) => {
                                    const product = findProduct(item.productId);
                                    return (
                                        <div key={item.productId} className="flex gap-4 items-center py-3 border-b last:border-b-0">
                                            <img className="w-20 h-20 object-contain border rounded" src={product?.images?.[0]?.url} alt={product?.name} />
                                            <div className="flex-1">
                                                <div className="font-medium line-clamp-1">{product?.name || `Sản phẩm #${item.productId}`}</div>
                                                <div className="text-sm text-gray-500 mt-1">x{item.quantity}</div>
                                            </div>
                                            <div className="text-[#dd2f2c] font-medium">{formatPrice(item.price || product?.discountPrice)}</div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="px-5 py-4 bg-[#fffefb] border-t flex flex-wrap justify-between items-center gap-3">
                                <div className="text-sm text-gray-500">
                                    {order.status === "cancelled" && order.statusHistory?.at(-1)?.note && `Lý do huỷ: ${order.statusHistory.at(-1).note}`}
                                </div>
                                <div className="flex flex-col items-end gap-3">
                                    <div>
                                        Thành tiền: <span className="text-xl font-semibold text-[#dd2f2c]">{formatPrice(order.totalPrice)}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        {renderActions(order)}
                                        <button
                                            className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                                            onClick={() => setSelectedOrderId(order.id)}
                                        >
                                            Xem chi tiết
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal chi tiết đơn hàng */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={() => setSelectedOrderId(null)}>
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Chi tiết đơn hàng #{selectedOrder.id}</h3>
                            <span className={`text-xs font-semibold uppercase px-3 py-1 rounded-full ${ORDER_STATUS[selectedOrder.status]?.badge}`}>
                                {ORDER_STATUS[selectedOrder.status]?.label}
                            </span>
                        </div>

                        <div className="mt-6">
                            <OrderTimeline order={selectedOrder} />
                        </div>

                        <div className="mt-4 border-t pt-4">
                            <h4 className="font-semibold">Địa chỉ nhận hàng</h4>
                            <p className="mt-1">{selectedOrder.name} - {selectedOrder.phone}</p>
                            <p className="text-gray-600">{selectedOrder.address}</p>
                        </div>

                        <div className="mt-4 border-t pt-4">
                            <h4 className="font-semibold">Sản phẩm</h4>
                            {selectedOrder.items.map((item) => {
                                const product = findProduct(item.productId);
                                return (
                                    <div key={item.productId} className="flex gap-4 items-center border rounded-xl p-2 mt-3">
                                        <img className="w-16 h-16 object-contain" src={product?.images?.[0]?.url} alt={product?.name} />
                                        <div className="flex-1">
                                            <div className="font-semibold line-clamp-1">{product?.name || `Sản phẩm #${item.productId}`}</div>
                                            <div className="text-sm text-gray-500">Số lượng: {item.quantity}</div>
                                        </div>
                                        <div className="text-[#dd2f2c] font-semibold">{formatPrice(item.price || product?.discountPrice)}</div>
                                    </div>
                                );
                            })}
                            <div className="mt-3 text-right">
                                Thành tiền: <span className="text-xl font-semibold text-[#dd2f2c]">{formatPrice(selectedOrder.totalPrice)}</span>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                            {renderActions(selectedOrder)}
                            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => setSelectedOrderId(null)}>
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
