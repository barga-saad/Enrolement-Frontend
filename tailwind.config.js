/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // BCP Morocco Brand Colors
        'bcp': {
          orange: '#FF9900',      // Primary BCP Orange
          'orange-light': '#FFB84D',
          'orange-dark': '#FF8800',
          'orange-soft': 'rgba(255, 153, 0, 0.1)',
          brown: '#6B4C3A',       // Secondary Brown
          'brown-light': '#8B6F63',
          'brown-dark': '#4A3728',
          grey: '#F5F5F5',        // Light Grey Background
          'grey-dark': '#E8E8E8',
          'grey-text': '#666666',
        },
        // Dark Mode specific colors
        'dark': {
          bg: '#121212',
          'bg-soft': '#1E1E1E',
          'bg-card': '#252525',
          text: '#F5F5F5',
          'text-dim': '#A0A0A0',
          border: '#333333',
        },
        // Status colors
        'status': {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        },
        // Warm palette for premium light theme
        'warm': {
          '50': '#FDFCFB',
          '100': '#F9F7F4',
          '200': '#F5F1EB', // Main card background (Light Theme)
          '300': '#EBE4DA',
          '400': '#D6C7B3',
          '500': '#B0987E',
          '600': '#8B735B', // Text/Borders in Light Theme
        }
      },
      backgroundImage: {
        'gradient-bcp': 'linear-gradient(135deg, #FF9900 0%, #6B4C3A 100%)',
        'gradient-bcp-soft': 'linear-gradient(135deg, #FFB84D 0%, #8B6F63 100%)',
        'gradient-bcp-dark': 'linear-gradient(135deg, #FF8800 0%, #4A3728 100%)',
        'gradient-subtle': 'linear-gradient(135deg, rgba(255, 153, 0, 0.1) 0%, rgba(107, 76, 58, 0.1) 100%)',
      },
      boxShadow: {
        'bcp-soft': '0 4px 12px rgba(255, 153, 0, 0.08)',
        'bcp-medium': '0 8px 24px rgba(107, 76, 58, 0.12)',
        'bcp-card': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'bcp-hover': '0 12px 32px rgba(255, 153, 0, 0.15)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        }
      },
      spacing: {
        'safe': 'env(safe-area-inset-bottom)',
      }
    },
  },
  plugins: [],
}
