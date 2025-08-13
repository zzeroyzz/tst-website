module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Background colors
    'bg-tst-white',
    'bg-tst-cream',
    'bg-tst-yellow',
    'bg-tst-purple',
    'bg-tst-teal',
    'bg-tst-green',
    'bg-tst-red',
    // Text colors
    'text-tst-white',
    'text-tst-cream',
    'text-tst-yellow',
    'text-tst-purple',
    'text-tst-teal',
    'text-tst-green',
    'text-tst-red',
    // Border colors (if you use them dynamically)
    'border-tst-purple',
    'border-tst-teal',
    'border-tst-yellow',
    // Add any other utility classes you generate dynamically
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
        brutalistXs: "2px 3px 0 #000",
        brutalistSm: "3px 3px 0 #000",
        brutalist: "4px 4px 0 #000",
        brutalistLg: "6px 6px 0 #000",
      },
      height:{
        "96": "24rem",
      },
      maxHeight:{
      "80": "20rem",
      "90": "24rem",

      },
      minHeight: {
       '0': '0',
       '100': '100px',
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
