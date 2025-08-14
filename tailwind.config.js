module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  purge: {
    content: [
      "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    // Prevent purging of critical styles
    options: {
      safelist: [
        // Core layout classes that should never be purged
        'bg-tst-cream',
        'text-black',
        'font-sans',
        'antialiased',
        // Navigation classes
        'flex',
        'justify-between',
        'items-center',
        'p-4',
        'py-4',
        'px-6',
        // Typography
        'font-bold',
        'font-medium',
        'text-lg',
        'text-xl',
        'text-2xl',
        'text-3xl',
        'text-4xl',
        'text-5xl',
        // All your custom colors
        'bg-tst-white',
        'bg-tst-cream',
        'bg-tst-yellow',
        'bg-tst-purple',
        'bg-tst-teal',
        'bg-tst-green',
        'bg-tst-red',
        'text-tst-white',
        'text-tst-cream',
        'text-tst-yellow',
        'text-tst-purple',
        'text-tst-teal',
        'text-tst-green',
        'text-tst-red',
        'border-tst-purple',
        'border-tst-teal',
        'border-tst-yellow',
        // Common layout classes
        'container',
        'mx-auto',
        'grid',
        'grid-cols-1',
        'md:grid-cols-2',
        'lg:grid-cols-3',
        'gap-4',
        'gap-6',
        'gap-8',
      ]
    }
  },
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
        sans: ["var(--font-work-sans)", "system-ui", "-apple-system", "sans-serif"],
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
