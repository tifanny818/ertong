/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,vue}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        'baby-pink': '#FFB6C1',
        'baby-blue': '#A8D8EA',
        'baby-yellow': '#FFE5A0',
        'baby-mint': '#B5EAD7',
        'baby-lavender': '#C7CEEA',
        'baby-warm': '#FFF8F0',
        'baby-dark': '#5D5A6F',
        'baby-medium': '#8B87A0',
      },
      fontFamily: {
        'cute': ['"ZCOOL KuaiLe"', 'cursive'],
        'body': ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
    },
  },
  plugins: [],
};
