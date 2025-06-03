import React from 'react';
import { View, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';

const ScreenWrapper = ({ children, style }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: SIZES.medium,
    paddingTop: Platform.OS === 'android' ? SIZES.medium : 0, // Adjust padding for Android status bar
    backgroundColor: COLORS.background,
  },
});

export default ScreenWrapper;
