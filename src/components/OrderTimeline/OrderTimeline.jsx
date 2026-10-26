import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileInvoice, faBoxOpen, faTruck, faCircleCheck, faBan } from "@fortawesome/free-solid-svg-icons";
import { ORDER_STATUS, ORDER_STEPS } from "../../constants/orderStatus";
import { formatDateAndTime } from "../../utils/utils";

const STEP_ICONS = {
    pending: faFileInvoice,
    confirmed: faBoxOpen,
    shipping: faTruck,
    delivered: faCircleCheck,
    cancelled: faBan,
};

// Hiển thị hành trình đơn hàng: thanh tiến trình + lịch sử cập nhật (giống Shopee)
function OrderTimeline({ order }) {
    const history = order.statusHistory || [];
    const isCancelled = order.status === "cancelled";
    const timeOf = (status) => history.find((h) => h.status === status)?.time;

    // Đơn bị huỷ: hiện các bước đã đi qua rồi tới bước "Đã huỷ"
    const steps = isCancelled
        ? [...ORDER_STEPS.filter((s) => timeOf(s)), "cancelled"]
        : ORDER_STEPS;
    const currentIndex = steps.indexOf(order.status);

    return (
        <div>
            <div className="flex items-start justify-between">
                {steps.map((step, index) => {
                    const done = index <= currentIndex;
                    const color = step === "cancelled" ? "#ef4444" : "#26aa99";
                    return (
                        <div key={step} className="flex-1 flex flex-col items-center relative">
                            {index > 0 && (
                                <div
                                    className="absolute top-6 right-1/2 w-full h-1 -z-0"
                                    style={{ backgroundColor: done ? color : "#e5e7eb" }}
                                />
                            )}
                            <div
                                className="relative z-10 w-12 h-12 rounded-full border-4 flex items-center justify-center bg-white"
                                style={{ borderColor: done ? color : "#e5e7eb", color: done ? color : "#9ca3af" }}
                            >
                                <FontAwesomeIcon icon={STEP_ICONS[step]} />
                            </div>
                            <div className={`mt-2 text-xs text-center font-medium ${done ? "text-gray-800" : "text-gray-400"}`}>
                                {ORDER_STATUS[step].stepLabel}
                            </div>
                            {timeOf(step) && (
                                <div className="text-[11px] text-gray-400 text-center">{formatDateAndTime(timeOf(step))}</div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-5 border-t pt-3">
                {[...history].reverse().map((h, index) => (
                    <div key={`${h.status}-${h.time}`} className="flex gap-3 text-sm py-1">
                        <div className="text-gray-400 w-32 shrink-0">{formatDateAndTime(h.time)}</div>
                        <div className={index === 0 ? "text-[#26aa99] font-semibold" : "text-gray-600"}>
                            {ORDER_STATUS[h.status]?.stepLabel}
                            {h.note && <span className="font-normal text-gray-500"> - {h.note}</span>}
                            {h.changedBy === "admin" && <span className="font-normal text-gray-400"> (Người bán)</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default OrderTimeline;
