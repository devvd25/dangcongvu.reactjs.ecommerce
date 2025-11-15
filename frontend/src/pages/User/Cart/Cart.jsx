import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import Navbar from "../../../components/Navbar/Navbar";
import { userAPI } from "../../../api/userApi";
import { getProfileFromLS } from "../../../utils/auth";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import emptyCart from "../../../assets/Cart/emptyCart.png"
import { Link } from "react-router-dom";
import path from "../../../constants/path";

function Cart() {
  const [cart, setCart] = useState(null);
  const [products, setProducts] = useState([]);
  const userId = getProfileFromLS().id;
  const dispatch = useDispatch();

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

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => {
      const product = products.find((p) => p.id === item.productId);
      const itemTotal = product ? product.discountPrice * item.quantity : 0;
      return total + itemTotal;
    }, 0);
  };

  const updateCartQuantity = async (productId, quantity) => {
    try {
      await userAPI.cart.updateCart(userId, productId, quantity);
      setCart((prevCart) => ({
        ...prevCart,
        items: prevCart.items.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        ),
      }));
    } catch (error) {
      console.error("Error updating cart quantity:", error);
    }
  };

  const removeProductFromCart = async (productId) => {
    Swal.fire({
      title: "Bạn có chắc chắn muốn xóa sản phẩm?",
      text: "Sản phẩm sẽ bị xóa khỏi giỏ hàng.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await userAPI.cart.removeProductToCart(userId, productId);
          setCart((prevCart) => ({
            ...prevCart,
            items: prevCart.items.filter((item) => item.productId !== productId),
          }));
          Swal.fire("Đã xóa!", "Sản phẩm đã được xóa khỏi giỏ hàng.", "success");
          dispatch({ type: 'SET_CART_ITEM_COUNT', payload: cart.items.length - 1 }); // Cập nhật số lượng sau khi xóa
        } catch (error) {
          Swal.fire("Lỗi!", "Không thể xóa sản phẩm. Vui lòng thử lại.", "error");
          console.error("Error removing product:", error);
        }
      }
    });
  };

  return (
    <>
      <div className="bg-[#f0f0f0] min-h-screen">
        {/* <Header /> */}
        <Navbar />
        <div className="container mx-auto px-4 lg:px-20 mt-4">
          <div className="text-center text-xl font-semibold">Giỏ hàng</div>
          <div className="flex justify-center">
            <div className="mt-3 bg-white rounded-xl p-6 mx-28">
              {cart && cart.items?.length > 0 ? (
                cart.items.map((item) => {
                  const product = products.find((p) => p.id === item.productId);
                  const itemTotal = product ? product.discountPrice * item.quantity : 0;

                  return (
                    <div key={item.productId}>
                      <div className="grid grid-cols-8 gap-4 items-start">
                        <div>
                          <img className="col-span-1 w-full h-auto" src={product?.images[0]?.url} alt={product?.name} />
                        </div>
                        <div className="col-span-6">
                          <div className="font-semibold line-clamp-1">{product?.name}</div>
                          <div className="font-semibold text-xs mt-1 line-clamp-2 w-[80%]">
                            Mô tả: <span className="text-[#344054] font-light">{product?.description}</span>
                          </div>
                        </div>
                        <div className="col-span-1">
                          <div className="text-[#dd2f2c] text-xl font-semibold w-max">{product?.discountPrice.toLocaleString()} ₫</div>
                          <div className="text-[#a4a4a4] line-through">{product?.salePrice.toLocaleString()} ₫</div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="flex justify-between items-center mr-3">
                          <button className="text-red-500" onClick={() => removeProductFromCart(item.productId)}>
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 h-full">
                          <button
                            className="text-xl px-3 py-[2px] border-black border border-r-0 col-span-1 rounded-s-md focus:bg-[#63aaed] focus:text-white focus:border-[#63aaed] hover:bg-[#63aaed] hover:text-white hover:border-[#63aaed]"
                            onClick={() => {
                              const newQuantity = item.quantity > 1 ? item.quantity - 1 : 1;
                              updateCartQuantity(item.productId, newQuantity);
                            }}
                          >
                            -
                          </button>
                          <div className="col-span-1 w-full font-medium h-full border-black border flex items-center justify-center">{item.quantity}</div>
                          <button
                            className="text-xl px-3 py-[2px] border-black border border-s-0 col-span-1 rounded-e-md focus:bg-[#63aaed] focus:text-white focus:border-[#63aaed] hover:bg-[#63aaed] hover:text-white hover:border-[#63aaed]"
                            onClick={() => {
                              const newQuantity = item.quantity + 1;
                              updateCartQuantity(item.productId, newQuantity);
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="font-semibold flex justify-between">
                          <div>Tạm tính:</div>
                          <div className="font-light">{itemTotal.toLocaleString()} ₫</div>
                        </div>
                      </div>
                      <div className="border-b my-4"></div>
                      <div className="flex justify-end">
                      </div>
                    </div>
                  );
                })
              ) : (
                <>
                    <div className="flex justify-center">
                        <img className="w-1/2" src={emptyCart} alt="" />
                    </div>
                    <div className="text-center text-2xl text-gray-700 font-semibold mt-4">Giỏ hàng trống</div>
                    <div className="text-center text-gray-400 font-semibold mt-2">Không có sản phẩm nào trong giỏ hàng</div>
                    <div className="mt-2 flex justify-center">
                        <Link to={path.home}
                        className="bg-[#63aaed] text-center text-base w-1/2 hover:bg-[#4b96dd] font-inter text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline"
                        >
                            Quay về trang chủ
                        </Link>
                    </div>
                </>
              )}
              {cart && cart.items?.length > 0 && (
                <>
                    <div className="mt-4 font-semibold text-[#dd2f2c] text-xl flex justify-end">Tổng : {calculateTotal().toLocaleString()} ₫</div>
                <div className="flex justify-end mt-3">
                    <Link to={path.checkout}
                        className="bg-[#63aaed] text-center text-base hover:bg-[#4b96dd] font-inter text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline"
                        >
                            Đặt hàng
                        </Link>

                </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Cart;