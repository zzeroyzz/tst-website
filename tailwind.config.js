/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "tst-white": "#FFFFFF",
        "tst-cream": "#F9F5F2",
        "tst-yellow": "#F7BD01",
        "tst-purple": "#C5A1FF",
        "tst-teal": "#69D4E9",
        "tst-green": "#7FBC8C",
        "tst-red": "#FF6B6B",
      },
      fontFamily: {
        sans: ["var(--font-work-sans)", "sans-serif"],
      },
      boxShadow: {
        brutalist: "4px 4px 0 #000",
        brutalistLg: "6px 6px 0 #000",
      },
      minHeight: {
       '0': '0',
       '110': '110px',
       '250': '250px',
       '320': '320px',
       '340': '340px',
       '400': '400px',
       '500': '500px',
       '575': '575px',
       '1500': '1500px',
      },
      minWidth:{
        '500': '500px'
      }
    },
  },
  plugins: [],
};
