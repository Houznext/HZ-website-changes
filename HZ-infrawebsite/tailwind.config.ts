import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0f2a44',
        'hz-blue': '#2f80ed',
        'hz-blue-hover': '#1a6dd6',
        'hz-blue-light': '#e8f1fd',
        'hz-accent': '#f2994a',
        'hz-charcoal': '#1f2933',
        'hz-muted': '#5a6a7e',
        'hz-border': '#dde8f5',
        'hz-offwhite': '#f5f7fa',
        'hz-red': '#dc2626',
        'hz-amber': '#d97706',
        'hz-teal': '#0d9488',
        charcoal: '#1f2933',
        muted: '#5a6a7e',
        border: '#dde8f5',
        offwhite: '#f5f7fa',
        hzwhite: '#ffffff',
      },
      fontFamily: {
        heading: ['Montserrat', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      maxWidth: {
        infra: '1440px',
      },
    },
  },
  plugins: [],
};

export default config;
