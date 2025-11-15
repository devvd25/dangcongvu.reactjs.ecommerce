import { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faUserGroup, faCalendarCheck } from '@fortawesome/free-solid-svg-icons';
import path from "../../constants/path";
import { Link, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { clearLS } from "../../utils/auth";

function Sidebar() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const isActive = (targetPath) => location.pathname === targetPath;
    const handleLogOut = () => {
        clearLS();
        navigate(path.loginAdmin);
    };

    return (
        <>
            <nav className="fixed top-0 z-50 w-full bg-gradient-to-r from-blue-400 to-blue-600 border-b border-blue-700">
                <div className="px-3 py-3 lg:px-5 lg:pl-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-start rtl:justify-end">
                            <Link to={path.dashboard} className="flex flex-col items-center cursor-pointer">
                                <div className="text-white text-4xl font-bold">Nhóm 10</div>
                                <div className="flex gap-5 items-center">
                                    <div className="w-11 border-b border-white"></div>
                                    <div className="w-11 border-b border-white"></div>
                                </div>
                            </Link>
                        </div>
                        <div className="flex items-center relative">
                            <div className="flex items-center me-10">
                                <button
                                    type="button"
                                    className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300"
                                    aria-expanded={dropdownOpen}
                                    onClick={toggleDropdown}
                                >
                                    <img
                                        className="w-8 h-8 rounded-full"
                                        src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                                        alt="user photo"
                                    />
                                </button>
                                {dropdownOpen && (
                                    <div className="absolute z-50 my-4 text-base min-w-40 list-none bg-gray-800 hover:bg-gray-700 divide-y divide-gray-100 rounded shadow-md right-[40%] top-[55%]">
                                        <ul>
                                            <li>
                                                <button className="block w-full py-2 text-sm text-white shadow-md font-semibold" onClick={handleLogOut}>Đăng xuất</button>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <aside id="logo-sidebar" className="fixed top-0 left-0 z-40 w-60 h-screen pt-20 transition-transform -translate-x-full bg-blue-50 border-r border-gray-200 sm:translate-x-0" aria-label="Sidebar">
                <div className="h-full px-3 py-6 overflow-y-auto text-black">
                    <ul className="space-y-2 font-medium">
                        <li>
                            <Link to={path.manageUser} className={`flex items-center p-2 rounded-lg font-semibold text-base group ${isActive(path.manageUser) ? 'bg-blue-500 text-white' : 'text-gray-800 hover:bg-blue-500 hover:text-white'}`}>
                                <FontAwesomeIcon icon={faUserGroup} className="mr-2" />
                                <span className="flex-1 ms-3 whitespace-nowrap">Quản lý người dùng</span>
                            </Link>
                        </li>
                        <li>
                            <Link to={path.manageProduct} className={`flex items-center p-2 rounded-lg font-semibold text-base group ${isActive(path.manageProduct) ? 'bg-blue-500 text-white' : 'text-gray-800 hover:bg-blue-500 hover:text-white'}`}>
                                <FontAwesomeIcon icon={faList} className="mr-2" />
                                <span className="flex-1 ms-3 whitespace-nowrap">Quản lý sản phẩm</span>
                            </Link>
                        </li>
                        <li>
                            <Link to={path.manageOrders} className={`flex items-center p-2 rounded-lg font-semibold text-base group ${isActive(path.manageOrders) ? 'bg-blue-500 text-white' : 'text-gray-800 hover:bg-blue-500 hover:text-white'}`}>
                                <FontAwesomeIcon icon={faCalendarCheck} className="mr-2" />
                                <span className="flex-1 ms-3 whitespace-nowrap">Quản lý đặt hàng</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;