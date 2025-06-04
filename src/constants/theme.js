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
  h1: { fontFamily: 'Orbitron-Bold', fontSize: SIZES.xxlarge },
  h2: { fontFamily: 'Orbitron-SemiBold', fontSize: SIZES.xlarge },
  h3: { fontFamily: 'Orbitron-Medium', fontSize: SIZES.large },
  body1: { fontFamily: 'Orbitron-Regular', fontSize: SIZES.medium },
  body2: { fontFamily: 'Orbitron-Regular', fontSize: SIZES.font },
  body3: { fontFamily: 'Orbitron-Regular', fontSize: SIZES.small },
  orbitronRegular: 'Orbitron-Regular',
  orbitronMedium: 'Orbitron-Medium',
  orbitronSemiBold: 'Orbitron-SemiBold',
  orbitronBold: 'Orbitron-Bold',
  orbitronBlack: 'Orbitron-Black',
};

const appTheme = { COLORS, SIZES, FONTS };

export default appTheme;
