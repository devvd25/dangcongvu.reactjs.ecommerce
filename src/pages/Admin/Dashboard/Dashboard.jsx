import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSackDollar, faReceipt, faUsers, faBoxesStacked, faTriangleExclamation, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import Sidebar from '../../../components/Sidebar/Sidebar';
import { adminAPI } from '../../../api/adminApi';
import path from '../../../constants/path';
import { ORDER_STATUS, ORDER_STEPS } from '../../../constants/orderStatus';
import { formatDateAndTime } from '../../../utils/utils';

const formatPrice = (value) => `${Number(value || 0).toLocaleString("vi-VN")} ₫`;

// Rút gọn số tiền cho trục biểu đồ: 12.500.000 -> 12,5tr
const formatShort = (value) => {
    if (value >= 1e9) return `${(value / 1e9).toLocaleString("vi-VN", { maximumFractionDigits: 1 })}tỷ`;
    if (value >= 1e6) return `${(value / 1e6).toLocaleString("vi-VN", { maximumFractionDigits: 1 })}tr`;
    if (value >= 1e3) return `${(value / 1e3).toLocaleString("vi-VN", { maximumFractionDigits: 0 })}k`;
    return String(value);
};

const formatDay = (isoDate) => {
    const [, m, d] = isoDate.split("-");
    return `${d}/${m}`;
};

// Thẻ số liệu tổng quan
function StatCard({ icon, iconClass, label, value, sub }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg ${iconClass}`}>
                <FontAwesomeIcon icon={icon} />
            </div>
            <div className="min-w-0">
                <div className="text-sm text-gray-500">{label}</div>
                <div className="text-2xl font-bold text-gray-800 truncate">{value}</div>
                {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
            </div>
        </div>
    );
}

// Biểu đồ cột doanh thu theo ngày (1 chuỗi số liệu nên dùng 1 màu, có tooltip khi rê chuột)
function RevenueChart({ data }) {
    const [hover, setHover] = useState(null);
    const max = Math.max(...data.map(d => d.revenue), 0);
    // Làm tròn mốc trục Y lên số "đẹp"
    const step = max > 0 ? Math.pow(10, Math.floor(Math.log10(max / 4))) : 1;
    const niceMax = max > 0 ? Math.ceil(max / 4 / step) * step * 4 : 4;
    const ticks = [4, 3, 2, 1, 0].map(i => (niceMax / 4) * i);
    const labelEvery = data.length > 14 ? Math.ceil(data.length / 8) : 1;

    return (
        <div className="relative">
            <div className="flex">
                <div className="w-12 h-56 flex flex-col justify-between text-[11px] text-gray-400 text-right pr-2 -mt-1.5">
                    {ticks.map(t => <div key={t}>{formatShort(t)}</div>)}
                </div>
                <div className="flex-1 relative h-56">
                    {ticks.map((t, i) => (
                        <div key={t} className="absolute left-0 right-0 border-t border-gray-100" style={{ top: `${(i / 4) * 100}%` }} />
                    ))}
                    <div className="absolute inset-0 flex items-end gap-[2px]">
                        {data.map((d, i) => (
                            <div
                                key={d.date}
                                className="flex-1 h-full flex items-end cursor-pointer"
                                onMouseEnter={() => setHover(i)}
                                onMouseLeave={() => setHover(null)}
                            >
                                <div
                                    className={`w-full max-w-[36px] mx-auto rounded-t ${hover === i ? 'bg-blue-700' : 'bg-blue-500'}`}
                                    style={{ height: `${niceMax ? (d.revenue / niceMax) * 100 : 0}%`, minHeight: d.revenue > 0 ? 2 : 0 }}
                                />
                            </div>
                        ))}
                    </div>
                    {hover !== null && (
                        <div
                            className="absolute z-10 -translate-x-1/2 -translate-y-full bg-gray-900 text-white text-xs rounded-lg px-3 py-2 pointer-events-none whitespace-nowrap shadow-lg"
                            style={{
                                left: `${((hover + 0.5) / data.length) * 100}%`,
                                top: `${100 - (niceMax ? (data[hover].revenue / niceMax) * 100 : 0)}%`,
                                marginTop: -8,
                            }}
                        >
                            <div className="font-semibold">{formatDay(data[hover].date)}</div>
                            <div>Doanh thu: {formatPrice(data[hover].revenue)}</div>
                            <div>Số đơn: {data[hover].orders}</div>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex ml-12 mt-2 gap-[2px]">
                {data.map((d, i) => (
                    <div key={d.date} className="flex-1 text-center text-[11px] text-gray-400">
                        {i % labelEvery === 0 || i === data.length - 1 ? formatDay(d.date) : ""}
                    </div>
                ))}
            </div>
        </div>
    );
}

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [days, setDays] = useState(7);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const response = await adminAPI.stats.getDashboard(days);
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching dashboard:", error);
                Swal.fire("Lỗi!", "Không thể tải số liệu tổng quan.", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [days]);

    const totalOrders = stats?.totals.orders || 0;
    const periodRevenue = stats?.revenueByDay.reduce((sum, d) => sum + d.revenue, 0) || 0;
    const periodOrders = stats?.revenueByDay.reduce((sum, d) => sum + d.orders, 0) || 0;

    return (
        <div className="bg-gray-50 min-h-screen">
            <Sidebar />
            <div className="p-4 sm:ml-60">
                <div className="p-4 mt-16">
                    <div className="flex flex-wrap justify-between items-end gap-3">
                        <div>
                            <div className="font-semibold text-2xl text-gray-800">Tổng quan cửa hàng</div>
                            <div className="text-sm text-gray-500 mt-1">Theo dõi doanh thu, đơn hàng và tồn kho</div>
                        </div>
                    </div>

                    {!stats ? (
                        <div className="text-center text-gray-500 py-20">{loading ? "Đang tải số liệu..." : "Không có dữ liệu."}</div>
                    ) : (
                        <>
                            {/* Thẻ số liệu */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
                                <StatCard
                                    icon={faSackDollar} iconClass="bg-green-100 text-green-600"
                                    label="Doanh thu (đã giao)" value={formatPrice(stats.totals.revenue)}
                                    sub={`Đang xử lý: ${formatPrice(stats.totals.pendingRevenue)}`}
                                />
                                <StatCard
                                    icon={faReceipt} iconClass="bg-blue-100 text-blue-600"
                                    label="Tổng đơn hàng" value={totalOrders.toLocaleString("vi-VN")}
                                    sub={`${stats.ordersByStatus.pending} đơn chờ xác nhận`}
                                />
                                <StatCard
                                    icon={faUsers} iconClass="bg-purple-100 text-purple-600"
                                    label="Khách hàng" value={stats.totals.customers.toLocaleString("vi-VN")}
                                    sub="Tài khoản người mua"
                                />
                                <StatCard
                                    icon={faBoxesStacked} iconClass="bg-orange-100 text-orange-600"
                                    label="Sản phẩm" value={stats.totals.products.toLocaleString("vi-VN")}
                                    sub={`${stats.totals.categories} danh mục · ${stats.totals.outOfStock} hết hàng`}
                                />
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
                                {/* Biểu đồ doanh thu */}
                                <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
                                    <div className="flex flex-wrap justify-between items-start gap-3 mb-5">
                                        <div>
                                            <div className="font-semibold text-gray-800">Doanh thu theo ngày</div>
                                            <div className="text-sm text-gray-500">
                                                {formatPrice(periodRevenue)} · {periodOrders} đơn (không tính đơn huỷ)
                                            </div>
                                        </div>
                                        <div className="flex bg-gray-100 rounded-lg p-1 text-sm">
                                            {[7, 30].map(d => (
                                                <button
                                                    key={d}
                                                    onClick={() => setDays(d)}
                                                    className={`px-3 py-1 rounded-md ${days === d ? 'bg-white shadow text-gray-800 font-medium' : 'text-gray-500'}`}
                                                >
                                                    {d} ngày
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <RevenueChart data={stats.revenueByDay} />
                                </div>

                                {/* Đơn hàng theo trạng thái */}
                                <div className="bg-white rounded-xl border border-gray-200 p-5">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="font-semibold text-gray-800">Đơn hàng theo trạng thái</div>
                                        <Link to={path.manageOrders} className="text-sm text-blue-600 hover:underline">Xử lý đơn</Link>
                                    </div>
                                    <div className="space-y-4">
                                        {[...ORDER_STEPS, "cancelled"].map(status => {
                                            const count = stats.ordersByStatus[status] || 0;
                                            const pct = totalOrders ? (count / totalOrders) * 100 : 0;
                                            return (
                                                <div key={status}>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-gray-600">{ORDER_STATUS[status].label}</span>
                                                        <span className="font-semibold text-gray-800">{count}</span>
                                                    </div>
                                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${ORDER_STATUS[status].bar}`} style={{ width: `${pct}%` }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
                                {/* Đơn hàng mới nhất */}
                                <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="font-semibold text-gray-800">Đơn hàng mới nhất</div>
                                        <Link to={path.manageOrders} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                            Xem tất cả <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                                        </Link>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-left text-gray-500 border-b">
                                                    <th className="py-2 font-medium">Mã đơn</th>
                                                    <th className="py-2 font-medium">Khách hàng</th>
                                                    <th className="py-2 font-medium">Ngày đặt</th>
                                                    <th className="py-2 font-medium text-right">Tổng tiền</th>
                                                    <th className="py-2 font-medium text-right">Trạng thái</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {stats.recentOrders.length === 0 && (
                                                    <tr><td colSpan={5} className="py-6 text-center text-gray-400">Chưa có đơn hàng</td></tr>
                                                )}
                                                {stats.recentOrders.map(order => (
                                                    <tr key={order.id} className="border-b last:border-b-0">
                                                        <td className="py-3 font-medium text-gray-800">#{order.id}</td>
                                                        <td className="py-3 text-gray-600">{order.name}</td>
                                                        <td className="py-3 text-gray-500">{formatDateAndTime(order.orderTime)}</td>
                                                        <td className="py-3 text-right font-medium text-gray-800">{formatPrice(order.totalPrice)}</td>
                                                        <td className="py-3 text-right">
                                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${ORDER_STATUS[order.status]?.badge}`}>
                                                                {ORDER_STATUS[order.status]?.label}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Sắp hết hàng */}
                                <div className="bg-white rounded-xl border border-gray-200 p-5">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="font-semibold text-gray-800 flex items-center gap-2">
                                            <FontAwesomeIcon icon={faTriangleExclamation} className="text-amber-500" />
                                            Sắp hết hàng
                                        </div>
                                        <Link to={path.manageProduct} className="text-sm text-blue-600 hover:underline">Nhập hàng</Link>
                                    </div>
                                    {stats.lowStock.length === 0 ? (
                                        <div className="py-6 text-center text-sm text-gray-400">Tồn kho đều trên {stats.totals.lowStockThreshold} sản phẩm</div>
                                    ) : (
                                        <ul className="divide-y">
                                            {stats.lowStock.map(p => (
                                                <li key={p.id} className="flex items-center gap-3 py-2">
                                                    <img src={p.image} alt={p.name} className="w-10 h-10 object-contain rounded border" />
                                                    <div className="flex-1 min-w-0 text-sm text-gray-700 line-clamp-1">{p.name}</div>
                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${p.stock <= 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                                                        {p.stock <= 0 ? 'Hết hàng' : `Còn ${p.stock}`}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            {/* Sản phẩm bán chạy */}
                            <div className="bg-white rounded-xl border border-gray-200 p-5 mt-4">
                                <div className="font-semibold text-gray-800 mb-3">Sản phẩm bán chạy</div>
                                {stats.topProducts.length === 0 ? (
                                    <div className="py-6 text-center text-sm text-gray-400">Chưa có dữ liệu bán hàng</div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                        {stats.topProducts.map((p, index) => (
                                            <div key={p.id} className="border rounded-xl p-3 relative">
                                                <span className="absolute top-2 left-2 w-6 h-6 rounded-full bg-gray-800 text-white text-xs flex items-center justify-center font-semibold">{index + 1}</span>
                                                <img src={p.image} alt={p.name} className="w-full h-28 object-contain" />
                                                <div className="text-sm font-medium text-gray-800 line-clamp-2 mt-2 min-h-[40px]">{p.name}</div>
                                                <div className="text-xs text-gray-500 mt-1">Đã bán: <span className="font-semibold text-gray-800">{p.sold}</span></div>
                                                <div className="text-xs text-gray-500">Doanh thu: <span className="font-semibold text-gray-800">{formatPrice(p.revenue)}</span></div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
