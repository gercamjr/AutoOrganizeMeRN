import { StyleSheet } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants/theme';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.medium,
    paddingTop: SIZES.medium,
  },
  darkThemeText: {
    color: COLORS.text,
  },
  h1: {
    ...FONTS.h1,
    color: COLORS.text,
  },
  h2: {
    ...FONTS.h2,
    color: COLORS.text,
  },
  h3: {
    ...FONTS.h3,
    color: COLORS.text,
  },
  // Add more global styles as needed
});
