import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SIZES, FONTS } from '../../constants/theme';

const AppButton = ({ title, onPress, style, textStyle, variant = 'primary', size = 'medium', disabled, loading }) => {
  const getButtonStyles = () => {
    switch (variant) {
      case 'secondary':
        return styles.buttonSecondary;
      case 'accent':
        return styles.buttonAccent;
      case 'error':
        return styles.buttonError;
      case 'transparent':
        return styles.buttonTransparent;
      default:
        return styles.buttonPrimary;
    }
  };

  const getTextStyles = () => {
    switch (variant) {
      case 'transparent':
        return styles.textTransparent;
      default:
        return styles.textPrimary;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return styles.buttonSmall;
      case 'large':
        return styles.buttonLarge;
      default:
        return {}; // Medium is default, no extra style needed or defined in common
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.buttonBase,
        getButtonStyles(),
        getSizeStyles(),
        disabled || loading ? styles.buttonDisabled : {},
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? COLORS.white : COLORS.primary} />
      ) : (
        <Text style={[styles.textBase, getTextStyles(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    paddingVertical: SIZES.small,
    paddingHorizontal: SIZES.medium,
    borderRadius: SIZES.base,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48, // Good tap target size
    marginVertical: SIZES.small,
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
  },
  buttonSecondary: {
    backgroundColor: COLORS.secondary,
  },
  buttonAccent: {
    backgroundColor: COLORS.accent,
  },
  buttonError: {
    backgroundColor: COLORS.error,
  },
  buttonTransparent: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonSmall: {
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.small,
    minHeight: 40,
  },
  buttonLarge: {
    paddingVertical: SIZES.medium,
    paddingHorizontal: SIZES.large,
    minHeight: 56,
  },
  textBase: {
    ...FONTS.body1,
    fontWeight: 'bold',
  },
  textPrimary: {
    color: COLORS.white,
  },
  textTransparent: {
    color: COLORS.primary,
  },
});

export default AppButton;
