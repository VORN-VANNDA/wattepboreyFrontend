/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary palette, sampled from the reference design.
        forest: {
          DEFAULT: '#1A3626', // main deep green (headers, buttons, CTAs)
          dark: '#0E2016',    // footer / darkest sections
          light: '#2C5038',   // hover states, secondary fills
        },
        gold: {
          DEFAULT: '#C9A227', // primary accent (Donate button, underlines, quotes)
          light: '#D9BB55',
          dark: '#A6841E',
        },
        cream: '#F7F6F1', // light section backgrounds
      },
      fontFamily: {
        // Khmer display face for big headings — chunky, ceremonial.
        display: ['"Moul"', 'ui-serif', 'serif'],
        // Khmer body face — clean and highly legible at small sizes.
        khmer: ['"Kantumruy Pro"', '"Noto Sans Khmer"', 'sans-serif'],
        // Latin body/UI face.
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px -4px rgba(26, 54, 38, 0.12)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}
