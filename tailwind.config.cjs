/** @type {import('tailwindcss').Config} */
module.exports = {
  // Class-based dark mode so we can toggle it on <html>
  darkMode: 'class',

  // Make sure Tailwind scans your app + components
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],

  theme: {
    container: {
      center: true,
      padding: "16px",
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1200px",
        "2xl": "1200px",
      },
    },
    extend: {
      // Expose brand tokens as utilities so you can use bg-primary, text-primary, etc.
      colors: {
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        "primary-foreground": "rgb(var(--color-primary-foreground) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        ring: "rgb(var(--color-ring) / <alpha-value>)",
      },
      // Default ring color reads the token
      ringColor: {
        DEFAULT: "rgb(var(--color-ring) / <alpha-value>)",
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 4px 12px -2px rgb(0 0 0 / 0.06)",
      },
    },
  },
  plugins: [],
};
