import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { initDatabase } from './src/database/database';
import { COLORS } from './src/constants/theme'; // Assuming your theme constants are here

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    initDatabase()
      .then(() => {
        console.log('Database initialized successfully');
        setDbInitialized(true);
      })
      .catch(err => {
        console.error('Database initialization failed:', err);
        setError(err); // You might want to display this error to the user
        setDbInitialized(true); // Still proceed to show the app, or handle error differently
      });
  }, []);

  if (!dbInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <StatusBar style="light" />
      </View>
    );
  }

  // Optionally, handle the error state by showing an error message
  // if (error) { ... }

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
    backgroundColor: COLORS.background, // Use dark background for loading
    alignItems: 'center',
    justifyContent: 'center',
  },
});
