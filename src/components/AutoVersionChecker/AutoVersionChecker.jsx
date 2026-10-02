import React, { useEffect, useState } from "react";

// Biến toàn cục lưu build version được Vite inject
const INITIAL_VERSION = typeof __APP_BUILD_VERSION__ !== "undefined" ? __APP_BUILD_VERSION__ : null;

export default function AutoVersionChecker() {
  const [currentVersion, setCurrentVersion] = useState(INITIAL_VERSION);
  const [newVersionDetected, setNewVersionDetected] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    let isMounted = true;
    let timerId = null;

    // Hàm kiểm tra version trên server
    const checkServerVersion = async () => {
      try {
        const response = await fetch(`/version.json?_t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        });

        if (!response.ok) return;

        const data = await response.json();
        const serverVer = data?.version;

        if (!serverVer) return;

        if (!currentVersion) {
          // Lưu lại version ban đầu nếu lúc đầu chưa có
          setCurrentVersion(serverVer);
        } else if (serverVer !== currentVersion) {
          // Phát hiện server đã có version mới (vừa deploy xong)!
          if (isMounted) {
            setNewVersionDetected(true);
          }
        }
      } catch (err) {
        // Lỗi mạng hoặc server đang khởi động lại, bỏ qua lần check này
      }
    };

    // Kiểm tra ngay khi khởi động nếu chưa có initial version
    if (!currentVersion) {
      checkServerVersion();
    }

    // Đặt chu kỳ kiểm tra mỗi 15 giây
    timerId = setInterval(checkServerVersion, 15000);

    // Kiểm tra ngay lập tức khi người dùng click quay lại tab trình duyệt
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkServerVersion();
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      isMounted = false;
      if (timerId) clearInterval(timerId);
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, [currentVersion]);

  // Đếm ngược và tự động reload khi phát hiện có bản mới
  useEffect(() => {
    if (!newVersionDetected) return;

    if (countdown > 0) {
      const cdTimer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(cdTimer);
    } else {
      // Hết đếm ngược -> tự động F5 lại trang để lấy code mới nhất!
      window.location.reload(true);
    }
  }, [newVersionDetected, countdown]);

  if (!newVersionDetected) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] max-w-sm w-full bg-white text-gray-800 rounded-2xl shadow-2xl border-2 border-blue-500 p-4 transition-all duration-300 animate-bounce">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-base text-gray-900">
            Hệ thống vừa cập nhật! 🎉
          </h4>
          <p className="text-xs text-gray-600 mt-1">
            Đã phát hiện phiên bản mới từ OnRender. Đang tự động làm mới trang sau{" "}
            <span className="font-bold text-blue-600 text-sm">{countdown}s</span>...
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => window.location.reload(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow transition-colors flex items-center gap-1.5"
            >
              <span>Làm mới ngay</span>
              <span>⚡</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
