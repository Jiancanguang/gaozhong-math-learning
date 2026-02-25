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
        ink: '#0f172a',
        paper: '#fef9f2',
        accent: '#ff6b35',
        tide: '#0d3b66',
        sky: '#79c7ff'
      },
      boxShadow: {
        card: '0 12px 30px rgba(13, 59, 102, 0.14)'
      },
      backgroundImage: {
        hero: 'radial-gradient(circle at 12% 20%, rgba(121, 199, 255, 0.45) 0%, rgba(254, 249, 242, 0) 40%), radial-gradient(circle at 90% 0%, rgba(255, 107, 53, 0.3) 0%, rgba(254, 249, 242, 0) 35%)'
      }
    }
  },
  plugins: []
};

export default config;
