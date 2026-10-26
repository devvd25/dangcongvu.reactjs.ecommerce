import React, { useEffect, useState, useMemo } from 'react'; // Import React và các hook cần thiết (useEffect, useState, useMemo)
import { adminAPI } from '../../../api/adminApi'; // Import API quản lý đơn hàng từ backend
import Swal from 'sweetalert2'; // Thư viện SweetAlert2 dùng để hiển thị các thông báo (thành công, lỗi)
import DataTable from 'react-data-table-component'; // Thư viện để hiển thị bảng dữ liệu có tính năng phân trang, tìm kiếm, sắp xếp
import Sidebar from '../../../components/Sidebar/Sidebar'; // Sidebar cho trang quản lý đơn hàng
import { formatDateAndTime } from '../../../utils/utils'; // Hàm tiện ích để định dạng ngày và giờ
import { ORDER_STATUS, ORDER_TABS, ADMIN_ACTIONS, ADMIN_CANCEL_REASONS } from '../../../constants/orderStatus'; // Nhãn, tab và thao tác theo trạng thái đơn
import OrderTimeline from '../../../components/OrderTimeline/OrderTimeline'; // Hành trình đơn hàng (giống Shopee)

// Định dạng số tiền theo kiểu Việt Nam (ví dụ: 10.000 ₫)
const formatPrice = (value) => `${Number(value || 0).toLocaleString("vi-VN")} ₫`;

// Component Quản lý đơn hàng
function ManageOrders() {
    // Khai báo các state để lưu trữ dữ liệu
    const [searchText, setSearchText] = useState(''); // State lưu trữ từ khoá tìm kiếm
    const [orders, setOrders] = useState([]); // State lưu trữ danh sách các đơn hàng
    const [activeTab, setActiveTab] = useState('all'); // State lưu tab trạng thái đang chọn
    const [selectedOrderId, setSelectedOrderId] = useState(null); // State lưu mã đơn hàng được chọn để xem chi tiết
    const [productDetails, setProductDetails] = useState([]); // State lưu trữ chi tiết sản phẩm trong đơn hàng
    const [loading, setLoading] = useState(true); // State kiểm tra xem dữ liệu có đang được tải hay không

    // Hàm lấy tất cả các đơn hàng từ API
    const fetchOrders = async () => {
        setLoading(true); // Đặt trạng thái loading thành true khi bắt đầu tải dữ liệu
        try {
            const response = await adminAPI.order.getAll(); // Gọi API để lấy danh sách tất cả các đơn hàng
            setOrders(response.data); // Lưu danh sách đơn hàng vào state "orders"
        } catch (error) {
            console.error("Error fetching orders:", error); // In lỗi ra nếu không lấy được dữ liệu
            // Hiển thị thông báo lỗi khi không tải được dữ liệu
            Swal.fire("Lỗi!", "Không thể tải danh sách đơn hàng. Vui lòng thử lại.", "error");
        } finally {
            setLoading(false); // Khi đã lấy được dữ liệu (hoặc lỗi), tắt trạng thái loading
        }
    };

    // useEffect để gọi hàm fetchOrders khi component được mount lần đầu tiên
    useEffect(() => {
        fetchOrders(); // Lấy danh sách đơn hàng khi component vừa được load
    }, []); // Mảng rỗng [] nghĩa là hàm chỉ chạy 1 lần khi component lần đầu tiên được render

    // Đếm số đơn theo từng trạng thái để hiển thị trên tab
    const countByStatus = useMemo(() => {
        return orders.reduce((counts, order) => {
            counts[order.status] = (counts[order.status] || 0) + 1;
            return counts;
        }, {});
    }, [orders]);

    // Hàm lọc đơn hàng theo tab trạng thái và từ khoá tìm kiếm
    const filteredOrders = useMemo(() => {
        const keyword = searchText.toLowerCase();
        return orders
            .filter(order => activeTab === 'all' || order.status === activeTab) // Lọc theo tab trạng thái
            .filter(order => // Lọc theo mã đơn, ngày đặt, tên hoặc số điện thoại người nhận
                order.id.toString().includes(searchText) ||
                formatDateAndTime(order.orderTime).includes(searchText) ||
                (order.name || '').toLowerCase().includes(keyword) ||
                (order.phone || '').includes(searchText)
            );
    }, [searchText, orders, activeTab]); // useMemo chỉ tính toán lại khi từ khoá, danh sách đơn hoặc tab thay đổi

    const selectedOrder = orders.find(order => order.id === selectedOrderId); // Đơn đang mở chi tiết (luôn lấy bản mới nhất trong state)

    // Hàm xem chi tiết sản phẩm trong đơn hàng
    const handleViewDetails = async (order) => {
        setSelectedOrderId(order.id); // Cập nhật đơn hàng được chọn để hiển thị chi tiết
        try {
            // Duyệt qua các sản phẩm trong đơn hàng và lấy thông tin sản phẩm từ API
            const products = await Promise.all(
                order.items.map(async (item) => {
                    const product = await adminAPI.product.getById(item.productId); // Lấy chi tiết sản phẩm theo ID sản phẩm
                    return {
                        ...product.data, // Kết hợp thông tin sản phẩm với số lượng trong đơn hàng
                        quantity: item.quantity, // Thêm số lượng sản phẩm vào
                        orderPrice: item.price, // Giá tại thời điểm đặt hàng
                    };
                })
            );
            setProductDetails(products); // Lưu chi tiết sản phẩm vào state
        } catch (error) {
            console.error("Error fetching product details:", error); // In lỗi ra nếu không lấy được chi tiết sản phẩm
            // Hiển thị thông báo lỗi khi không tải được thông tin sản phẩm
            Swal.fire("Lỗi!", "Không thể tải thông tin sản phẩm. Vui lòng thử lại.", "error");
        }
    };

    // Hàm đóng modal chi tiết đơn hàng
    const handleCloseModal = () => {
        setSelectedOrderId(null); // Đặt lại mã đơn được chọn về null (đóng modal)
        setProductDetails([]); // Xoá chi tiết sản phẩm
    };

    // Hàm chuyển trạng thái đơn hàng (xác nhận, giao hàng, đã giao, huỷ)
    const handleChangeStatus = async (order, action) => {
        let note;
        if (action.status === 'cancelled') {
            // Huỷ đơn: bắt buộc chọn lý do để người mua biết
            const { value: reason } = await Swal.fire({
                title: `Huỷ đơn hàng #${order.id}?`,
                text: "Tồn kho của sản phẩm sẽ được hoàn lại.",
                input: 'select',
                inputOptions: Object.fromEntries(ADMIN_CANCEL_REASONS.map(r => [r, r])),
                inputPlaceholder: '-- Chọn lý do huỷ --',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                confirmButtonText: 'Huỷ đơn',
                cancelButtonText: 'Quay lại',
                inputValidator: (value) => !value && 'Vui lòng chọn lý do huỷ đơn',
            });
            if (!reason) return; // Người dùng bấm "Quay lại"
            note = reason;
        } else {
            // Các thao tác khác: hỏi xác nhận trước khi chuyển trạng thái
            const result = await Swal.fire({
                title: `${action.label}?`,
                text: `Đơn #${order.id} sẽ chuyển sang "${ORDER_STATUS[action.status].label}".`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Xác nhận',
                cancelButtonText: 'Quay lại',
            });
            if (!result.isConfirmed) return;
        }

        try {
            const response = await adminAPI.order.updateStatus(order.id, action.status, note); // Gọi API đổi trạng thái
            setOrders(prev => prev.map(o => (o.id === order.id ? response.data : o))); // Cập nhật đơn trong danh sách
            Swal.fire("Thành công!", `Đơn #${order.id}: ${ORDER_STATUS[action.status].label}.`, "success");
        } catch (error) {
            console.error("Error updating order status:", error);
            Swal.fire("Lỗi!", error.response?.data?.message || "Không thể cập nhật trạng thái đơn hàng.", "error");
        }
    };

    // Hiển thị các nút thao tác hợp lệ với trạng thái hiện tại của đơn
    const renderActions = (order, size = 'text-xs px-2 py-1') => (
        (ADMIN_ACTIONS[order.status] || []).map(action => (
            <button
                key={action.status}
                className={`rounded ${size} ${action.className}`}
                onClick={() => handleChangeStatus(order, action)}
            >
                {action.label}
            </button>
        ))
    );

    // Cấu hình các cột cho bảng dữ liệu (DataTable)
    const columns = [
        {
            name: 'Mã Đơn Hàng', // Tiêu đề cột
            selector: row => Number(row.id), // Sắp xếp theo số của mã đơn
            format: row => `#${row.id}`, // Hiển thị mã đơn hàng dạng #id
            sortable: true, // Cho phép sắp xếp cột
            width: '120px',
        },
        {
            name: 'Người Nhận', // Tiêu đề cột
            cell: row => (
                <div>
                    <div>{row.name}</div>
                    <div className="text-xs text-gray-500">{row.phone}</div>
                </div>
            ),
        },
        {
            name: 'Tổng Tiền', // Tiêu đề cột
            selector: row => row.totalPrice, // Sắp xếp theo giá trị số
            format: row => formatPrice(row.totalPrice), // Hiển thị tổng tiền với định dạng số (ví dụ: 10.000 ₫)
            sortable: true, // Cho phép sắp xếp cột
        },
        {
            name: 'Ngày Đặt', // Tiêu đề cột
            selector: row => new Date(row.orderTime).getTime(), // Sắp xếp theo thời gian thật
            format: row => formatDateAndTime(row.orderTime), // Định dạng ngày giờ từ hàm formatDateAndTime
            sortable: true, // Cho phép sắp xếp cột
        },
        {
            name: 'Trạng Thái', // Tiêu đề cột
            selector: row => row.status,
            cell: row => (
                <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${ORDER_STATUS[row.status]?.badge}`}>
                    {ORDER_STATUS[row.status]?.label}
                </span>
            ),
            sortable: true,
        },
        {
            name: 'Thao Tác', // Tiêu đề cột
            cell: row => (
                <div className="flex flex-wrap gap-1 py-1">
                    {renderActions(row)}
                    <button className="text-blue-500 hover:underline text-sm" onClick={() => handleViewDetails(row)}>
                        Xem chi tiết
                    </button>
                </div>
            ),
            ignoreRowClick: true, // Không cho phép click vào toàn bộ dòng, chỉ có thể click vào các nút
            minWidth: '260px',
        },
    ];

    // Nếu dữ liệu đang được tải, hiển thị thông báo "Đang tải dữ liệu..."
    if (loading) {
        return <div className="text-center">Đang tải dữ liệu...</div>;
    }

    return (
        <>
        <div>
            <Sidebar /> {/* Hiển thị Sidebar bên trái */}
            <div className="p-4 sm:ml-60 overflow-x-auto">
                <div className="p-4 mt-20">
                    {/* Tiêu đề và thanh tìm kiếm */}
                    <div className="w-full flex justify-between items-center">
                        <div className="font-semibold text-2xl">Quản lý đơn hàng</div>
                        <div>
                            <input
                                type="text"
                                placeholder="Mã đơn, tên, SĐT..."
                                value={searchText} // Hiển thị giá trị tìm kiếm hiện tại
                                onChange={(e) => setSearchText(e.target.value)} // Cập nhật giá trị tìm kiếm mỗi khi người dùng gõ vào ô tìm kiếm
                                className="p-2 border border-gray-500 rounded w-56"
                            />
                        </div>
                    </div>
                    {/* Tab lọc đơn theo trạng thái, kèm số lượng đơn mỗi trạng thái */}
                    <div className="mt-6 flex border-b overflow-x-auto">
                        {ORDER_TABS.map(tab => {
                            const count = tab.key === 'all' ? orders.length : countByStatus[tab.key] || 0;
                            const active = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${active ? 'border-[#2a83e9] text-[#2a83e9]' : 'border-transparent text-gray-600 hover:text-[#2a83e9]'}`}
                                >
                                    {tab.label}
                                    <span className={`ml-1 text-xs px-2 rounded-full ${active ? 'bg-[#2a83e9] text-white' : 'bg-gray-200'}`}>{count}</span>
                                </button>
                            );
                        })}
                    </div>
                    <div className="mt-4">
                        {/* Bảng dữ liệu hiển thị danh sách đơn hàng */}
                        <DataTable
                            columns={columns} // Cấu hình các cột bảng
                            data={filteredOrders} // Dữ liệu bảng là các đơn hàng đã lọc
                            pagination // Cho phép phân trang
                            highlightOnHover // Làm nổi bật dòng khi hover chuột
                            striped // Dòng bảng có màu nền thay đổi khi duyệt qua
                            customStyles={{ // Tùy chỉnh kiểu dáng bảng
                                headRow: {
                                    style: {
                                        fontSize: '15px',
                                        fontWeight: 'bold',
                                        backgroundColor: '#2a83e9',
                                        borderStartStartRadius: '15px',
                                        borderStartEndRadius: '15px',
                                        color: "#fff"
                                    }
                                },
                                rows: {
                                    style: {
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        fontFamily: 'inter',
                                        paddingTop: '6px',
                                        paddingBottom: '6px',
                                        whiteSpace: 'normal',
                                        overflow: 'visible',
                                    }
                                },
                            }}
                            noDataComponent={<div className="text-center py-6">Không tìm thấy đơn hàng nào.</div>} // Hiển thị thông báo khi không có dữ liệu
                        />
                    </div>
                </div>
            </div>

        </div>
            {/* Modal hiển thị chi tiết đơn hàng */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Chi tiết đơn hàng #{selectedOrder.id}</h3>
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${ORDER_STATUS[selectedOrder.status]?.badge}`}>
                                {ORDER_STATUS[selectedOrder.status]?.label}
                            </span>
                        </div>
                        {/* Hành trình đơn hàng */}
                        <div className="mt-6">
                            <OrderTimeline order={selectedOrder} />
                        </div>
                        <div className="mt-4 border-t pt-4">
                            <h4 className="font-semibold">Thông tin người nhận:</h4>
                            <p>Họ tên: {selectedOrder.name}</p>
                            <p>Địa chỉ: {selectedOrder.address}</p>
                            <p>Điện thoại: {selectedOrder.phone}</p>
                        </div>
                        <div className="mt-4">
                            <h4 className="font-semibold">Sản phẩm:</h4>
                            {/* Hiển thị danh sách sản phẩm trong đơn hàng */}
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
                                    <div className="col-span-1 text-[#dd2f2c] text-xl font-semibold">{formatPrice(product.orderPrice || product.discountPrice)}</div>
                                </div>
                            ))}
                            <div className="mt-3 text-right font-semibold">
                                Tổng tiền: <span className="text-[#dd2f2c] text-xl">{formatPrice(selectedOrder.totalPrice)}</span>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            {renderActions(selectedOrder, 'px-4 py-2')}
                            <button
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
                                onClick={handleCloseModal}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ManageOrders; // Export component quản lý đơn hàng
