const brand = (shade) => `rgb(var(--brand-${shade}) / <alpha-value>)`;
const ease = 'cubic-bezier(0.22, 1, 0.36, 1)';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        // Indigo by default; the vendor portal switches to violet via .theme-vendor (see index.css)
        brand: { 50: brand(50), 100: brand(100), 200: brand(200), 500: brand(500), 600: brand(600), 700: brand(700) },
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)',
        pop: '0 10px 30px -10px rgba(15, 23, 42, 0.25)',
      },
      // Entrance animations use "backwards" fill so hover transforms still work once they finish.
      animation: {
        'fade-in': 'fade-in 0.3s ease-out backwards',
        'fade-up': `fade-up 0.5s ${ease} backwards`,
        page: `page-in 0.4s ${ease} backwards`,
        swap: `swap 0.4s ${ease} backwards`,
        'scale-in': `scale-in 0.22s ${ease} backwards`,
        'slide-in': `slide-in 0.4s ${ease} backwards`,
        pop: 'pop 0.35s ease-out',
        'cart-bounce': 'cart-bounce 0.55s ease-out',
        bar: 'bar 1.2s ease-in-out infinite',
        'logo-pulse': 'logo-pulse 1.6s ease-in-out infinite',
        dot: 'dot 1.2s ease-in-out infinite both',
      },
    },
  },
  plugins: [],
};
