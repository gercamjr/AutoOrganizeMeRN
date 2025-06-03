export const COLORS = {
  primary: '#0D47A1', // Dark Blue
  secondary: '#1565C0', // Medium Blue
  accent: '#1E88E5', // Light Blue
  background: '#121212', // Very Dark Grey (almost black)
  surface: '#1E1E1E', // Dark Grey
  text: '#E0E0E0', // Light Grey
  textSecondary: '#BDBDBD', // Medium Grey
  placeholder: '#757575', // Grey
  error: '#D32F2F', // Red
  success: '#388E3C', // Green
  warning: '#FBC02D', // Yellow
  white: '#FFFFFF',
  black: '#000000',
  border: '#424242', // Darker grey for borders
};

export const SIZES = {
  base: 8,
  small: 12,
  font: 14,
  medium: 16,
  large: 18,
  xlarge: 24,
  xxlarge: 32,
};

export const FONTS = {
  // We'll define actual font families after loading them
  h1: { fontSize: SIZES.xxlarge, fontWeight: 'bold' },
  h2: { fontSize: SIZES.xlarge, fontWeight: 'bold' },
  h3: { fontSize: SIZES.large, fontWeight: 'bold' },
  body1: { fontSize: SIZES.medium },
  body2: { fontSize: SIZES.font },
  body3: { fontSize: SIZES.small },
};

const appTheme = { COLORS, SIZES, FONTS };

export default appTheme;
