import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 60px rgba(137, 120, 255, 0.18)',
      },
      backgroundImage: {
        'radial-fade': 'radial-gradient(circle at top, rgba(92, 81, 255, 0.16), transparent 34%)',
        'hero-grid': 'radial-gradient(circle at top right, rgba(188, 133, 255, 0.12), transparent 20%), radial-gradient(circle at 20% 20%, rgba(255, 111, 120, 0.16), transparent 18%)',
      },
      colors: {
        ink: '#0B0F1E',
        surface: '#101423',
        panel: 'rgba(255,255,255,0.06)',
        highlight: '#7C5CFF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
