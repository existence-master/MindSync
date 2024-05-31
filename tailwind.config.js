/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
        quicksand: ["Quicksand", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        lora: ["Lora", "serif"],
      },
      screens: {
        xs: "128px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      colors: {
        stilleto: "#8A2846",
        paleRose: "#FFE0E9",
        lividBrown: "#522E38",
        hibiscus: "#B9375E",
        tawnyPort: "#602437",
        tickleMePink: "#FF7AA2",
      },
    },
  },
  plugins: [],
};
