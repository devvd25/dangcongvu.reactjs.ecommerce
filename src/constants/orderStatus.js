// Trạng thái đơn hàng - khớp với backend (models/Order.js)
export const ORDER_STATUS = {
  pending: {
    label: "Chờ xác nhận",
    stepLabel: "Đơn hàng đã đặt",
    badge: "bg-yellow-100 text-yellow-700",
    bar: "bg-yellow-400",
  },
  confirmed: {
    label: "Chờ lấy hàng",
    stepLabel: "Đã xác nhận",
    badge: "bg-blue-100 text-blue-700",
    bar: "bg-blue-500",
  },
  shipping: {
    label: "Đang giao",
    stepLabel: "Đang giao hàng",
    badge: "bg-indigo-100 text-indigo-700",
    bar: "bg-indigo-500",
  },
  delivered: {
    label: "Đã giao",
    stepLabel: "Giao hàng thành công",
    badge: "bg-green-100 text-green-700",
    bar: "bg-green-500",
  },
  cancelled: {
    label: "Đã huỷ",
    stepLabel: "Đã huỷ đơn",
    badge: "bg-red-100 text-red-600",
    bar: "bg-red-400",
  },
};

// Các bước của đơn hàng bình thường (dùng cho thanh tiến trình)
export const ORDER_STEPS = ["pending", "confirmed", "shipping", "delivered"];

// Tab lọc đơn hàng giống Shopee
export const ORDER_TABS = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: ORDER_STATUS.pending.label },
  { key: "confirmed", label: ORDER_STATUS.confirmed.label },
  { key: "shipping", label: ORDER_STATUS.shipping.label },
  { key: "delivered", label: ORDER_STATUS.delivered.label },
  { key: "cancelled", label: ORDER_STATUS.cancelled.label },
];

// Thao tác admin được phép ở mỗi trạng thái
export const ADMIN_ACTIONS = {
  pending: [
    { status: "confirmed", label: "Xác nhận đơn", className: "bg-blue-500 hover:bg-blue-600 text-white" },
    { status: "cancelled", label: "Huỷ đơn", className: "bg-red-500 hover:bg-red-600 text-white" },
  ],
  confirmed: [
    { status: "shipping", label: "Giao cho vận chuyển", className: "bg-indigo-500 hover:bg-indigo-600 text-white" },
    { status: "cancelled", label: "Huỷ đơn", className: "bg-red-500 hover:bg-red-600 text-white" },
  ],
  shipping: [
    { status: "delivered", label: "Đã giao hàng", className: "bg-green-500 hover:bg-green-600 text-white" },
  ],
};

export const CANCEL_REASONS = [
  "Muốn thay đổi địa chỉ giao hàng",
  "Muốn thay đổi sản phẩm trong đơn hàng",
  "Tìm thấy giá rẻ hơn ở chỗ khác",
  "Đổi ý, không muốn mua nữa",
  "Lý do khác",
];

export const ADMIN_CANCEL_REASONS = [
  "Sản phẩm tạm hết hàng",
  "Không liên lạc được với người nhận",
  "Thông tin giao hàng không hợp lệ",
  "Lý do khác",
];
