import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONTS } from '../../constants/theme';

const AppTextInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  error,
  style,
  inputStyle,
  labelStyle,
  ...props
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
          error ? styles.inputError : {},
          inputStyle,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        selectionColor={COLORS.primary} // Cursor color
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.medium,
  },
  label: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    marginBottom: SIZES.base / 2,
  },
  input: {
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    ...FONTS.body1,
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.small,
    borderRadius: SIZES.base,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 48, // Consistent height with buttons
  },
  multilineInput: {
    minHeight: 100, // Taller for multiline
    textAlignVertical: 'top', // Start text from top in Android
    paddingTop: SIZES.small, // Adjust padding for multiline
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    ...FONTS.body3,
    color: COLORS.error,
    marginTop: SIZES.base / 2,
  },
});

export default AppTextInput;
