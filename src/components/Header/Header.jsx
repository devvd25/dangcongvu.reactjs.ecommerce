import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBars,
    faLocationDot,
    faSearch,
    faShoppingCart,
    faUser,
    faXmark,
    faCaretDown,
} from '@fortawesome/free-solid-svg-icons';
import { clearLS, getProfileFromLS } from '../../utils/auth';
import path from '../../constants/path';
import { useSelector, useDispatch } from 'react-redux';
import { userAPI } from '../../api/userApi';
import { formatPrice } from '../../utils/utils';
import logo from '../../assets/logo.png'; // Đường dẫn đúng đến file ảnh

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const cartItemCount = useSelector((state) => state.cartItemCount);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const categoryDropdownRef = useRef(null);

    useEffect(() => {
        const user = getProfileFromLS();
        if (user) {
            setIsLoggedIn(true);
            setUserName(user.username);
        }

        const fetchCart = async () => {
            try {
                const response = await userAPI.cart.get(user.id);
                const cart = response.data[0]?.items || [];
                const totalQuantity = cart.reduce((total, item) => total + 1, 0);
                dispatch({ type: 'SET_CART_ITEM_COUNT', payload: totalQuantity });
            } catch (error) {
                console.error('Lỗi khi lấy giỏ hàng:', error);
            }
        };

        if (isLoggedIn) {
            fetchCart();
        }

        const fetchCategories = async () => {
            try {
                const response = await userAPI.category.getAll();
                setCategories(response.data);
            } catch (error) {
                console.error('Lỗi khi lấy danh mục:', error);
            }
        };

        fetchCategories();
    }, [dispatch, isLoggedIn]);

    const handleLogout = () => {
        clearLS();
        setIsLoggedIn(false);
        navigate(path.login);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)
            ) {
                setIsDropdownOpen(false);
                setIsCategoryDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSearchChange = async (e) => {
        const value = e.target.value;
        setSearchText(value);

        if (value) {
            try {
                const response = await userAPI.product.getAll();
                const results = response.data.filter((product) =>
                    product.name.toLowerCase().includes(value.toLowerCase())
                );
                setSearchResults(results);
            } catch (error) {
                console.error('Lỗi khi tìm kiếm sản phẩm:', error);
            }
        } else {
            setSearchResults([]);
        }
    };

    const handleCategoryClick = () => {
        setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
        setIsDropdownOpen(false); // Đóng dropdown người dùng
    };

    const handleSelectProduct = (product) => {
        navigate(`/category/${product.categoryId}/product/${product.id}`);
        setSearchText('');
        setSearchResults([]);
        setIsDropdownOpen(false); // Đóng dropdown kết quả tìm kiếm
    };

    return (
        <header className="bg-[#2a83e9] text-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 lg:px-20">
                <div className="flex flex-wrap items-center justify-between py-3 text-white">
                    <div className="flex items-center">
                        <Link to={path.home} className="text-lg md:text-xl font-bold text-[#fef201] whitespace-nowrap">
                        <img src={logo} alt="Logo" className="ml-2 w-30 h-20" /> {/* Thêm className nếu cần style */}
                        </Link>
                    </div>

                    <button className="lg:hidden p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        <FontAwesomeIcon icon={isMobileMenuOpen ? faXmark : faBars} className="text-white text-xl" />
                    </button>

                    <div className={`${isMobileMenuOpen ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row w-full lg:w-auto mt-4 lg:mt-0 gap-4 lg:items-center`}>
                        <div className="relative w-full" ref={categoryDropdownRef}>
                            <button className="flex items-center gap-2 hover:bg-[#2871d5] rounded-[32px] py-3 px-4 whitespace-nowrap" onClick={handleCategoryClick}>
                                <FontAwesomeIcon icon={faBars} />
                                <span>Danh mục</span>
                            </button>
                            {isCategoryDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 bg-white text-black shadow-lg rounded-lg z-50 w-full">
                                    <div className="py-2">
                                        {categories.map((category) => (
                                            <div 
                                                key={category.id} 
                                                onClick={() => {
                                                    console.log(`Navigating to /category/${category.id}`);
                                                    navigate(`/category/${category.id}`);
                                                    setIsCategoryDropdownOpen(false); // Đóng dropdown khi chọn danh mục
                                                }}
                                                className="block px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                            >
                                                {category.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative w-full lg:w-72">
                            <button className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                <FontAwesomeIcon icon={faSearch} className="text-gray-500" />
                            </button>
                            <input
                                type="text"
                                placeholder="Bạn tìm gì..."
                                value={searchText}
                                onChange={handleSearchChange}
                                className="w-full lg:w-72 border rounded-[32px] py-3 px-10 focus:outline-none text-xs text-black"
                                onFocus={() => setIsCategoryDropdownOpen(false)}
                            />
                            {searchResults.length > 0 && (
                                <div className="absolute z-10 bg-white shadow-lg rounded-lg mt-1 w-full max-h-96 overflow-y-auto text-black">
                                    {searchResults.map(result => (
                                        <div 
                                            key={result.id} 
                                            className="block px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                            onClick={() => handleSelectProduct(result)}
                                        >
                                            <div className="grid grid-cols-5 gap-2">
                                                <div className="col-span-1">
                                                    <img className='w-full h-15' src={result.images[0].url} alt="" />
                                                </div>
                                                <div className="col-span-3">
                                                    <div className='text-[10px] line-clamp-2'>{result.name}</div>
                                                </div>
                                                <div className="col-span-1">
                                                    <div className="text-[#dd2f2c] text-[10px] font-semibold w-max">{formatPrice(result.discountPrice)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col lg:flex-row gap-2 relative" ref={dropdownRef}>
                            {isLoggedIn ? (
                                <div className="relative">
                                    <button className="flex items-center gap-2 hover:bg-[#2871d5] rounded-[32px] py-3 px-4 whitespace-nowrap" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                                        <FontAwesomeIcon icon={faUser} className="text-base" />
                                        <span>{userName}</span>
                                        <FontAwesomeIcon icon={faCaretDown} className="text-base" />
                                    </button>
                                    {isDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg z-50">
                                            <Link to={path.historyOrder} className="block px-4 py-2 hover:bg-gray-200">Lịch sử mua hàng</Link>
                                            <button className="block w-full text-left px-4 py-2 hover:bg-gray-200" onClick={handleLogout}>Đăng xuất</button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link to="/login">
                                    <button className="flex items-center gap-2 hover:bg-[#2871d5] rounded-[32px] py-3 px-4 whitespace-nowrap">
                                        <FontAwesomeIcon icon={faUser} className="text-base" />
                                        <span>Đăng nhập</span>
                                    </button>
                                </Link>
                            )}

                            <Link to={path.cart} className="flex items-center gap-2 hover:bg-[#2871d5] rounded-[32px] py-3 px-4 whitespace-nowrap relative">
                                <FontAwesomeIcon icon={faShoppingCart} className="text-base" />
                                <span>Giỏ hàng</span>
                                {cartItemCount > 0 && (
                                    <span className="absolute top-2 left-6 flex justify-center items-center text-[9px] w-3 h-3 bg-red-600 text-white rounded-full font-semibold">
                                        {cartItemCount}
                                    </span>
                                )}
                            </Link>
                            <button className="flex items-center gap-2 bg-[#5194e8] rounded-[32px] hover:bg-[#2871d5] py-3 px-4 whitespace-nowrap min-w-44 max-w-44">
                                <FontAwesomeIcon icon={faLocationDot} className="text-lg" />
                                
                                <span className='line-clamp-2'>Đà Nẵng</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;