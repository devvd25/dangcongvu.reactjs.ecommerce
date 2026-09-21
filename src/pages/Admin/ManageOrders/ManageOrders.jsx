import React, { useEffect, useState, useMemo } from 'react'; // Import React và các hook cần thiết (useEffect, useState, useMemo)
import { adminAPI } from '../../../api/adminApi'; // Import API quản lý đơn hàng từ backend
import Swal from 'sweetalert2'; // Thư viện SweetAlert2 dùng để hiển thị các thông báo (thành công, lỗi)
import DataTable from 'react-data-table-component'; // Thư viện để hiển thị bảng dữ liệu có tính năng phân trang, tìm kiếm, sắp xếp
import Sidebar from '../../../components/Sidebar/Sidebar'; // Sidebar cho trang quản lý đơn hàng
import { formatDateAndTime } from '../../../utils/utils'; // Hàm tiện ích để định dạng ngày và giờ

// Component Quản lý đơn hàng
function ManageOrders() {
    // Khai báo các state để lưu trữ dữ liệu
    const [searchText, setSearchText] = useState(''); // State lưu trữ từ khoá tìm kiếm
    const [orders, setOrders] = useState([]); // State lưu trữ danh sách các đơn hàng
    const [selectedOrder, setSelectedOrder] = useState(null); // State lưu trữ đơn hàng được chọn để xem chi tiết
    const [productDetails, setProductDetails] = useState([]); // State lưu trữ chi tiết sản phẩm trong đơn hàng
    const [loading, setLoading] = useState(true); // State kiểm tra xem dữ liệu có đang được tải hay không

    // Hàm lấy tất cả các đơn hàng từ API
    const fetchOrders = async () => {
        setLoading(true); // Đặt trạng thái loading thành true khi bắt đầu tải dữ liệu
        try {
            const response = await adminAPI.order.getAll(); // Gọi API để lấy danh sách tất cả các đơn hàng
            console.log(response); // In ra dữ liệu nhận được từ API để kiểm tra
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

    // Hàm lọc đơn hàng theo từ khoá tìm kiếm
    const filteredOrders = useMemo(() => {
        return orders.filter(order => // Duyệt qua tất cả các đơn hàng
            order.id.toString().includes(searchText) || // Kiểm tra xem mã đơn hàng có chứa từ khoá tìm kiếm không
            order.orderTime.toString().toLowerCase().includes(searchText.toLowerCase()) // Kiểm tra ngày đặt có chứa từ khoá không (so sánh không phân biệt chữ hoa chữ thường)
        );
    }, [searchText, orders]); // useMemo chỉ tính toán lại khi `searchText` hoặc `orders` thay đổi

    // Hàm xem chi tiết sản phẩm trong đơn hàng
    const handleViewDetails = async (order) => {
        setSelectedOrder(order); // Cập nhật đơn hàng được chọn để hiển thị chi tiết
        try {
            // Duyệt qua các sản phẩm trong đơn hàng và lấy thông tin sản phẩm từ API
            const products = await Promise.all(
                order.items.map(async (item) => {
                    const product = await adminAPI.product.getById(item.productId); // Lấy chi tiết sản phẩm theo ID sản phẩm
                    return {
                        ...product.data, // Kết hợp thông tin sản phẩm với số lượng trong đơn hàng
                        quantity: item.quantity, // Thêm số lượng sản phẩm vào
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
        setSelectedOrder(null); // Đặt lại state selectedOrder về null (đóng modal)
        setProductDetails([]); // Xoá chi tiết sản phẩm
    };

    // Cấu hình các cột cho bảng dữ liệu (DataTable)
    const columns = [
        {
            name: 'Mã Đơn Hàng', // Tiêu đề cột
            selector: row => `#${row.id}`, // Chọn dữ liệu là mã đơn hàng (row.id)
            sortable: true, // Cho phép sắp xếp cột
        },
        {
            name: 'Tổng Tiền', // Tiêu đề cột
            selector: row => `${row.totalPrice.toLocaleString()} ₫`, // Hiển thị tổng tiền với định dạng số (ví dụ: 10.000 ₫)
            sortable: true, // Cho phép sắp xếp cột
        },
        {
            name: 'Ngày Đặt', // Tiêu đề cột
            selector: row => formatDateAndTime(row.orderTime), // Định dạng ngày giờ từ hàm formatDateAndTime
            sortable: true, // Cho phép sắp xếp cột
        },
        {
            name: 'Chi Tiết', // Tiêu đề cột
            cell: row => (
                <button className="text-blue-500 hover:underline" onClick={() => handleViewDetails(row)}>
                    Xem chi tiết
                </button> // Hiển thị nút "Xem chi tiết" cho mỗi đơn hàng
            ),
            ignoreRowClick: true, // Không cho phép click vào toàn bộ dòng, chỉ có thể click vào nút "Xem chi tiết"
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
                                placeholder="Tìm kiếm đơn hàng..."
                                value={searchText} // Hiển thị giá trị tìm kiếm hiện tại
                                onChange={(e) => setSearchText(e.target.value)} // Cập nhật giá trị tìm kiếm mỗi khi người dùng gõ vào ô tìm kiếm
                                className="p-2 border border-gray-500 rounded w-56"
                            />
                        </div>
                    </div>
                    <div className="mt-6">
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
                            noDataComponent={<div className="text-center">Không tìm thấy đơn hàng nào.</div>} // Hiển thị thông báo khi không có dữ liệu
                        />
                    </div>
                </div>
            </div>

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
        </>
    );
}

export default ManageOrders; // Export component quản lý đơn hàng
