const removeSpecialCharacter = (str) =>
  str.replace(
    /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
    ""
  );

export const generateNameId = ({ name, id }) => {
  return removeSpecialCharacter(name).replace(/\s/g, "-") + `-i-${id}`;
};

export const getIdFromNameId = (nameId) => {
  const arr = nameId.split("-i-");
  return arr[arr.length - 1];
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("vi-VN", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
};
export const formatPrice = (price) => {
  // Chuyển đổi giá thành số nếu cần
  const numericPrice = Number(price);

  // Sử dụng toLocaleString để định dạng giá với dấu chấm
  const formattedPrice = numericPrice.toLocaleString("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return `${formattedPrice}₫`; // Thêm ký hiệu ₫ vào cuối
};
// Hàm chuyển đổi giá trị thời gian từ định dạng "HH:MM" thành phút
export const convertTimeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};
export const formatDateToYYYYMMDD = (dateString) => {
  const date = new Date(dateString);

  // Lấy năm, tháng, ngày từ đối tượng Date
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0 nên cần cộng thêm 1
  const day = String(date.getDate()).padStart(2, "0");

  // Trả về chuỗi theo định dạng "yyyy-MM-dd"
  return `${year}-${month}-${day}`;
};
export function convertToTimeValue(timeString) {
  // Tách chuỗi thời gian thành giờ, phút và giây
  const [hours, minutes, seconds] = timeString.split(":");

  // Trả về định dạng HH:mm
  return `${hours}:${minutes}`;
}
export function formatDateAndTime(dateString) {
  const date = new Date(dateString);

  // Lấy các thành phần của ngày
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  // Kết hợp thành chuỗi theo định dạng yêu cầu
  return `${day}/${month}/${year}, ${hours}:${minutes}`;
}
export function formatDateToDDMMYYYY(dateString) {
  // Tách chuỗi ngày
  const parts = dateString.split("/");
  if (parts.length !== 3) {
    throw new Error(
      "Định dạng ngày không hợp lệ. Vui lòng sử dụng mm/dd/yyyy."
    );
  }

  const month = parts[0];
  const day = parts[1];
  const year = parts[2];

  // Trả về định dạng dd/mm/yyyy
  return `${day}/${month}/${year}`;
}
