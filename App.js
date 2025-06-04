import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
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
  const [error, setError] = useState(null);

  useEffect(() => {
    async function prepareApp() {
      try {
        // Initialize database and load fonts in parallel
        await Promise.all([
          initDatabase(),
          Font.loadAsync(customFonts),
        ]);
        console.log('Database and fonts initialized successfully');
      } catch (e) {
        console.warn('Initialization failed:', e);
        setError(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepareApp();
  }, []);

  if (!appIsReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <StatusBar style="light" />
      </View>
    );
  }

  // Optionally, handle the error state by showing an error message
  // if (error && !appIsReady) { ... return <ErrorScreen message={error.message} />; }

  return (
    <>
      <AppNavigator />
      <StatusBar style="light" />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
