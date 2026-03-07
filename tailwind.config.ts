import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './content/**/*.{md,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: '#2d2a33',
        paper: '#efeced',
        accent: '#e17055',
        tide: '#6c5ce7',
        sky: '#a29bfe',
        'gt-primary': '#6c5ce7',
        'gt-accent': '#e17055',
        'gt-green': '#00b894',
        'gt-gold': '#f0932b',
        'gt-red': '#e05555'
      },
      boxShadow: {
        card: '0 2px 8px rgba(45, 42, 51, 0.09), 0 4px 16px rgba(45, 42, 51, 0.06)'
      },
      backgroundImage: {
        hero: 'radial-gradient(circle at 12% 20%, rgba(108, 92, 231, 0.12) 0%, transparent 40%), radial-gradient(circle at 90% 0%, rgba(225, 112, 85, 0.1) 0%, transparent 35%)'
      }
    }
  },
  plugins: []
};

export default config;
