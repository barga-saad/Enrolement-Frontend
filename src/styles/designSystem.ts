/**
 * BCP BANK MOROCCO - DESIGN SYSTEM
 * 
 * Color Tokens and Brand Identity
 * Inspired by BCP's professional banking identity
 */

export const COLORS = {
  // Primary Brand Colors (Orange - BCP Main Identity)
  primary: {
    main: '#FF9900',
    light: '#FFB84D',
    lighter: '#FFE4CC',
    dark: '#FF8800',
    darker: '#CC7700',
  },

  // Secondary Brand Colors (Brown)
  secondary: {
    main: '#6B4C3A',
    light: '#8B6F63',
    lighter: '#A89080',
    dark: '#4A3728',
    darker: '#2D2319',
  },

  // Neutral Greys
  grey: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E8E8E8',
    300: '#D9D9D9',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // Semantic Colors
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },

  // Backgrounds
  background: {
    main: '#FFFFFF',
    secondary: '#F5F5F5',
    tertiary: '#E8E8E8',
  },

  // Text
  text: {
    primary: '#212121',
    secondary: '#666666',
    tertiary: '#999999',
    light: '#FFFFFF',
  },
} as const;

export const GRADIENTS = {
  // BCP Brand Gradients
  primary: 'linear-gradient(135deg, #FF9900 0%, #6B4C3A 100%)',
  primaryLight: 'linear-gradient(135deg, #FFB84D 0%, #8B6F63 100%)',
  primaryDark: 'linear-gradient(135deg, #FF8800 0%, #4A3728 100%)',
  primaryReverse: 'linear-gradient(135deg, #6B4C3A 0%, #FF9900 100%)',

  // Subtle Backgrounds
  subtle: 'linear-gradient(135deg, rgba(255, 153, 0, 0.05) 0%, rgba(107, 76, 58, 0.05) 100%)',
  subtleLight: 'linear-gradient(135deg, rgba(255, 184, 77, 0.08) 0%, rgba(139, 111, 99, 0.08) 100%)',

  // Status Gradients
  success: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  warning: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
  error: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
  info: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
} as const;

export const SHADOWS = {
  // Soft shadow for cards
  soft: '0 2px 8px rgba(0, 0, 0, 0.06)',
  
  // Medium shadow for elevated elements
  medium: '0 4px 12px rgba(107, 76, 58, 0.12)',
  
  // Orange-tinted shadow (brand)
  brand: '0 4px 12px rgba(255, 153, 0, 0.08)',
  
  // Hover state shadow
  hover: '0 8px 24px rgba(255, 153, 0, 0.15)',
  
  // Subtle glow
  glow: '0 0 20px rgba(255, 153, 0, 0.1)',
  
  // Card elevation
  card: '0 1px 3px rgba(0, 0, 0, 0.05), 0 4px 6px rgba(0, 0, 0, 0.05)',
  
  // Elevated card
  elevated: '0 4px 6px rgba(0, 0, 0, 0.07), 0 16px 32px rgba(255, 153, 0, 0.1)',
} as const;

export const TYPOGRAPHY = {
  // Font families
  fontFamily: {
    sans: "'Segoe UI', 'Helvetica Neue', sans-serif",
    mono: "'Fira Code', monospace",
  },

  // Font sizes
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '28px',
    '4xl': '32px',
    '5xl': '40px',
  },

  // Font weights
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
} as const;

export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
} as const;

export const BORDER_RADIUS = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px',
} as const;

export const Z_INDEX = {
  hide: -1,
  auto: 'auto',
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modal: 400,
  popover: 500,
  tooltip: 600,
} as const;
