import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userAPI } from "../../../api/userApi";
import { getProfileFromLS } from "../../../utils/auth";
import Swal from "sweetalert2";
import emptyCart from "../../../assets/Cart/emptyCart.png";
import path from "../../../constants/path";
import { useDispatch } from "react-redux";

function Checkout() {
    const [cart, setCart] = useState(null);
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Thông tin đặt hàng của người dùng
    const [orderInfo, setOrderInfo] = useState({
        name: '',
        address: '',
        phone: '', // Trường số điện thoại
    });
    const userId = getProfileFromLS().id;

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const response = await userAPI.cart.get(userId);
                setCart(response.data[0]);
            } catch (error) {
                console.error("Error fetching cart:", error);
            }
        };

        const fetchProducts = async () => {
            try {
                const response = await userAPI.product.getAll();
                setProducts(response.data);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchCart();
        fetchProducts();
    }, [userId]);

    // Tính tổng tiền trong giỏ hàng
    const calculateTotal = () => {
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((total, item) => {
            const product = products.find((p) => p.id === item.productId);
            return total + (product ? product.discountPrice * item.quantity : 0);
        }, 0);
    };

    // Xử lý khi người dùng nhấn "Đặt hàng"
    const handleOrderSubmit = async (e) => {
        e.preventDefault();

        // Kiểm tra các trường không được để trống
        if (!orderInfo.name || !orderInfo.address || !orderInfo.phone) {
            Swal.fire("Lỗi!", "Vui lòng điền đầy đủ thông tin đặt hàng.", "error");
            return;
        }

        // Kiểm tra định dạng số điện thoại
        const phoneRegex = /^(0|\+84)\d{9}$/; // Định dạng số điện thoại: bắt đầu với 0 hoặc +84 và theo sau là 9 chữ số
        if (!phoneRegex.test(orderInfo.phone)) {
            Swal.fire("Lỗi!", "Số điện thoại không hợp lệ. Vui lòng kiểm tra lại.", "error");
            return;
        }

        // Kiểm tra tồn kho cho từng sản phẩm trong giỏ hàng
        for (const item of cart.items) {
            const product = products.find((p) => p.id === item.productId);
            if (product && product.stock < item.quantity) {
                Swal.fire("Lỗi!", `Không đủ hàng cho sản phẩm: ${product.name}`, "error");
                return;
            }
        }

        // Dữ liệu đơn hàng
        const orderData = {
            userId,
            items: cart.items,
            totalPrice: calculateTotal(),
            orderTime: new Date().toISOString(), // Thời gian đặt hàng
            ...orderInfo, // Thông tin người dùng (tên, địa chỉ, số điện thoại)
        };

        try {
            // Gửi đơn hàng lên server
            await userAPI.order.create(orderData);

            // Cập nhật tồn kho sau khi đặt hàng
            await Promise.all(cart.items.map(async (item) => {
                const product = products.find((p) => p.id === item.productId);
                if (product) {
                    const newStock = product.stock - item.quantity;
                    await userAPI.product.updateStock(product.id, newStock);
                }
            }));

            // Làm sạch giỏ hàng sau khi đặt hàng thành công
            await userAPI.cart.resetCart(userId);
            dispatch({ type: 'SET_CART_ITEM_COUNT', payload: 0 }); // Reset số lượng sản phẩm trong giỏ hàng
            Swal.fire("Thành công!", "Đặt hàng thành công!", "success").then(() => {
                navigate(path.home); // Điều hướng về trang chủ
            });
        } catch (error) {
            console.error("Error placing order:", error);
            Swal.fire("Lỗi!", "Không thể đặt hàng. Vui lòng thử lại.", "error");
        }
    };

    return (
        <div className="bg-[#f0f0f0] min-h-screen">
            <div className="container mx-auto px-4 lg:px-20 pt-4">
                <div className="text-center text-xl font-semibold">Thanh Toán</div>
                <div className="flex justify-center">
                    <div className="mt-3 bg-white rounded-xl p-6 mx-32">
                        {/* Kiểm tra nếu giỏ hàng không trống */}
                        {cart && cart.items?.length > 0 ? (
                            cart.items.map((item) => {
                                const product = products.find((p) => p.id === item.productId);
                                const itemTotal = product ? product.discountPrice * item.quantity : 0;

                                return (
                                    <div key={item.productId}>
                                        <div className="grid grid-cols-8 gap-4 items-start">
                                            <img className="col-span-1 w-full h-20" src={product?.images[0]?.url} alt={product?.name} />
                                            <div className="col-span-6">
                                                <div className="font-semibold text-base line-clamp-1">{product?.name}</div>
                                                <div className="font-semibold text-xs mt-1 line-clamp-2 w-[80%]">
                                                    Mô tả: <span className="text-[#344054] font-light">{product?.description}</span>
                                                </div>
                                                <div className="font-semibold text-xs mt-1 line-clamp-2">
                                                    Số lượng: <span className="text-[#344054] font-light">{item?.quantity}</span>
                                                </div>
                                            </div>
                                            <div className="col-span-1 text-[#dd2f2c] w-max text-xl font-semibold">{product?.discountPrice.toLocaleString()} ₫</div>
                                        </div>
                                        <div className="mt-4">
                                            <div className="font-semibold flex justify-between">
                                                <div>Tạm tính:</div>
                                                <div className="font-light">{itemTotal.toLocaleString()} ₫</div>
                                            </div>
                                        </div>
                                        <div className="border-b my-4"></div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center">
                                <img className="w-1/2" src={emptyCart} alt="" />
                                <div className="text-2xl text-gray-700 font-semibold mt-4">Giỏ hàng trống</div>
                                <div className="text-gray-400 font-semibold mt-2">Không có sản phẩm nào trong giỏ hàng</div>
                                <Link to={path.home} className="bg-[#63aaed] text-center text-base w-1/2 hover:bg-[#4b96dd] text-white font-bold py-2 px-4 rounded-lg mt-2">
                                    Quay về trang chủ
                                </Link>
                            </div>
                        )}
                        {cart && cart.items?.length > 0 && (
                            <div className="mt-4 font-semibold text-[#dd2f2c] text-xl flex justify-end">Tổng : {calculateTotal().toLocaleString()} ₫</div>
                        )}
                        {cart && cart.items?.length > 0 && (
                            <form onSubmit={handleOrderSubmit} className="mt-6">
                                {/* Input cho các trường: Họ tên, Địa chỉ, Số điện thoại */}
                                {['name', 'address', 'phone'].map((field) => (
                                    <div className="mb-4" key={field}>
                                        <label className="block text-sm font-medium text-gray-700">
                                            {field === 'name' ? 'Họ và tên' : field === 'address' ? 'Địa chỉ' : 'Số điện thoại'}:
                                        </label>
                                        <input
                                            type={field === 'phone' ? 'tel' : 'text'}
                                            value={orderInfo[field]}
                                            onChange={(e) =>
                                                setOrderInfo({
                                                    ...orderInfo,
                                                    [field]: field === 'phone'
                                                        ? e.target.value.replace(/[^0-9+]/g, '').slice(0, 12) // Chỉ cho phép số và "+"
                                                        : e.target.value,
                                                })
                                            }
                                            className="border rounded w-full p-[6px] focus:outline-none focus:border-blue-500"
                                            required
                                            placeholder={
                                                field === 'phone'
                                                    ? 'Nhập số điện thoại (VD: 0123456789 hoặc +84123456789)'
                                                    : `Nhập ${field}`
                                            }
                                        />
                                    </div>
                                ))}
                                <div className="flex justify-end">
                                    <button type="submit" className="bg-[#63aaed] text-white font-bold py-2 px-4 rounded hover:bg-[#4b96dd]">
                                        Đặt hàng
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Checkout;
