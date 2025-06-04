import React, { useEffect, useState } from 'react'; // Added React import
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { initDatabase } from './src/database/database';
import { COLORS } from './src/constants/theme';
import * as Font from 'expo-font';

// Define the fonts we want to load
const customFonts = {
  'Orbitron-Regular': require('./src/assets/fonts/Orbitron-Regular.ttf'),
  'Orbitron-Medium': require('./src/assets/fonts/Orbitron-Medium.ttf'),
  'Orbitron-SemiBold': require('./src/assets/fonts/Orbitron-SemiBold.ttf'),
  'Orbitron-Bold': require('./src/assets/fonts/Orbitron-Bold.ttf'),
  'Orbitron-Black': require('./src/assets/fonts/Orbitron-Black.ttf'),
  // Add other weights/styles if you have them
};

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [initializationError, setInitializationError] = useState(null); // Renamed for clarity

  useEffect(() => {
    async function prepareApp() {
      try {
        console.log('Starting app preparation...');
        // Initialize database and load fonts in parallel
        await Promise.all([
          initDatabase(), 
          Font.loadAsync(customFonts),
        ]);
        console.log('Database and fonts initialized successfully.');
        setAppIsReady(true); // Set ready only on full success
      } catch (e) {
        console.error('App initialization failed:', e); // Changed to console.error for better visibility
        setInitializationError(e);
        // setAppIsReady(true); // Consider if you want to show the app with an error or a dedicated error screen
      } 
      // Removed finally block for setAppIsReady, now it's set on success or an error is displayed
    }

    prepareApp();
  }, []);

  // Show loading indicator until app is ready or an error occurs
  if (!appIsReady && !initializationError) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <StatusBar style="light" />
      </View>
    );
  }

  // Show an error message if initialization failed
  if (initializationError) {
    return (
      <View style={styles.errorContainer}> 
        <Text style={styles.errorText}>App Initialization Failed</Text>
        <Text style={styles.errorDetails}>{initializationError.message}</Text>
        {/* You could add a button to retry initialization here */}
        <StatusBar style="light" />
      </View>
    );
  }

  // If app is ready and no errors, render the main navigator
  if (appIsReady) {
    return (
      <>
        <AppNavigator />
        <StatusBar style="light" />
      </>
    );
  }

  // Fallback, though theoretically one of the above states should always be met
  return null; 
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: { // Added styles for error screen
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: { // Added styles for error text
    fontSize: 20,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'Orbitron-Bold', // Assuming Orbitron is loaded or use a default
  },
  errorDetails: { // Added styles for error details
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontFamily: 'Orbitron-Regular',
  },
});
