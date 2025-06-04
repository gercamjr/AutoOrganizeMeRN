import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { AppButton } from '../components/common'; // Corrected import path
import { COLORS, FONTS, SIZES } from '../constants/theme'; // Corrected import path for theme

const HomeScreen = () => {
  const navigation = useNavigation(); // Get navigation object

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Auto Organize Me!</Text>
      <Text style={styles.subtitle}>Manage your customers, tasks, and invoices efficiently.</Text>
      
      <View style={styles.buttonContainer}>
        <AppButton 
          title="Manage Customers"
          onPress={() => navigation.navigate('CustomerList')} // Navigate to CustomerList
          style={styles.button}
          textStyle={styles.buttonText}
        />
        {/* Add more buttons for other features later */}
        {/* e.g., Manage Tasks, Manage Invoices, etc. */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.padding * 2, // Use SIZES from theme
    backgroundColor: COLORS.background, // Use COLORS from theme
  },
  title: {
    fontFamily: FONTS.orbitronBold, // Use FONTS from theme
    fontSize: SIZES.h1, // Use SIZES from theme
    color: COLORS.primary, // Use COLORS from theme
    textAlign: 'center',
    marginBottom: SIZES.padding, // Use SIZES from theme
  },
  subtitle: {
    fontFamily: FONTS.orbitronRegular, // Use FONTS from theme
    fontSize: SIZES.body3, // Use SIZES from theme
    color: COLORS.textSecondary, // Use COLORS from theme
    textAlign: 'center',
    marginBottom: SIZES.padding * 2, // Use SIZES from theme
  },
  buttonContainer: {
    width: '100%',
    marginTop: SIZES.padding * 2,
  },
  button: {
    // AppButton will have its own styling, but you can add overrides or container styles here
    marginBottom: SIZES.medium,
  },
  buttonText: {
    // If AppButton allows passing textStyle
    fontFamily: FONTS.orbitronSemiBold,
  }
});

export default HomeScreen;
