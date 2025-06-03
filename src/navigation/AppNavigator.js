import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen'; // We'll create this soon

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Auto Organize Me' }} />
        {/* Add other screens here as we build them */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
