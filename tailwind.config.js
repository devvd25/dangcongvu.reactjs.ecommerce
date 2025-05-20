/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Arial", "sans-serif"], // Đặt Poppins làm font mặc định
        inter: ["Inter"],
      },
      boxShadow: {
        custom: "0 0 16px rgba(0, 0, 0, 0.11)",
      },
    },
  },
  plugins: [],
};
