import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChartPie, faReceipt, faBoxesStacked, faLayerGroup, faUserGroup,
    faStore, faRightFromBracket, faBars, faXmark, faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import path from "../../constants/path";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { clearLS, getProfileFromLS } from "../../utils/auth";

// Menu quản trị, chia nhóm giống các trang admin bán hàng
const MENU = [
    {
        title: "Tổng quan",
        items: [{ to: path.dashboard, label: "Dashboard", icon: faChartPie }],
    },
    {
        title: "Bán hàng",
        items: [{ to: path.manageOrders, label: "Đơn hàng", icon: faReceipt }],
    },
    {
        title: "Sản phẩm",
        items: [
            { to: path.manageProduct, label: "Sản phẩm", icon: faBoxesStacked },
            { to: path.manageCategories, label: "Danh mục", icon: faLayerGroup },
        ],
    },
    {
        title: "Khách hàng",
        items: [{ to: path.manageUser, label: "Người dùng", icon: faUserGroup }],
    },
];

function Sidebar() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const dropdownRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const profile = getProfileFromLS() || {};
    const displayName = profile.username || "Admin";

    const isActive = (targetPath) => location.pathname === targetPath;
    const currentItem = MENU.flatMap(group => group.items).find(item => isActive(item.to));

    // Đóng menu tài khoản khi bấm ra ngoài
    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleLogOut = () => {
        clearLS();
        navigate(path.loginAdmin);
    };

    return (
        <>
            <nav className="fixed top-0 z-50 w-full h-16 bg-white border-b border-gray-200 shadow-sm">
                <div className="h-full px-3 lg:px-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            className="sm:hidden w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label="Mở menu"
                        >
                            <FontAwesomeIcon icon={mobileOpen ? faXmark : faBars} />
                        </button>
                        <Link to={path.dashboard} className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-bold">10</div>
                            <div className="leading-tight">
                                <div className="font-bold text-gray-800">Nhóm 10</div>
                                <div className="text-[11px] text-gray-500">Kênh người bán</div>
                            </div>
                        </Link>
                        {currentItem && (
                            <div className="hidden md:flex items-center text-sm text-gray-500 ms-8">
                                <span>Quản trị</span>
                                <span className="mx-2">/</span>
                                <span className="text-gray-800 font-medium">{currentItem.label}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            to={path.home}
                            target="_blank"
                            className="hidden sm:flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-gray-100"
                        >
                            <FontAwesomeIcon icon={faStore} />
                            Xem cửa hàng
                        </Link>
                        <div className="relative" ref={dropdownRef}>
                            <button
                                type="button"
                                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100"
                                aria-expanded={dropdownOpen}
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold uppercase">
                                    {displayName.charAt(0)}
                                </div>
                                <span className="hidden sm:block text-sm font-medium text-gray-700">{displayName}</span>
                                <FontAwesomeIcon icon={faChevronDown} className="text-xs text-gray-400" />
                            </button>
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                                    <div className="px-4 py-2 border-b">
                                        <div className="text-sm font-semibold text-gray-800">{displayName}</div>
                                        <div className="text-xs text-gray-500 truncate">{profile.email || "Quản trị viên"}</div>
                                    </div>
                                    <button
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        onClick={handleLogOut}
                                    >
                                        <FontAwesomeIcon icon={faRightFromBracket} />
                                        Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {mobileOpen && (
                <div className="fixed inset-0 z-30 bg-black/40 sm:hidden" onClick={() => setMobileOpen(false)} />
            )}

            <aside
                id="logo-sidebar"
                className={`fixed top-0 left-0 z-40 w-60 h-screen pt-16 transition-transform bg-slate-900 sm:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
                aria-label="Sidebar"
            >
                <div className="h-full px-3 py-5 overflow-y-auto">
                    {MENU.map(group => (
                        <div key={group.title} className="mb-5">
                            <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{group.title}</div>
                            <ul className="space-y-1">
                                {group.items.map(item => (
                                    <li key={item.to}>
                                        <Link
                                            to={item.to}
                                            onClick={() => setMobileOpen(false)}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(item.to) ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                                        >
                                            <FontAwesomeIcon icon={item.icon} className="w-4" />
                                            <span>{item.label}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
