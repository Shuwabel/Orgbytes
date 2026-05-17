/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1D4ED8",
          light: "#DBEAFE",
          dark: "#1E3A8A",
        },
        secondary: {
          DEFAULT: "#16A34A",
          light: "#DCFCE7",
        },
        status: {
          verified: "#16A34A",
          verifiedBg: "#DCFCE7",
          pending: "#D97706",
          pendingBg: "#FEF3C7",
          unverified: "#6B7280",
          unverifiedBg: "#F3F4F6",
        },
      },
      fontFamily: {
        sans: ["Segoe UI", "Tahoma", "Geneva", "Verdana", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0, 0, 0, 0.06)",
      },
    },
  },
  plugins: [],
};

