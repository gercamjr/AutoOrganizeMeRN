import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import CustomerListScreen from '../screens/CustomerManagement/CustomerListScreen';
import AddEditCustomerScreen from '../screens/CustomerManagement/AddEditCustomerScreen';
import { COLORS, FONTS } from '../constants/theme';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.background, // Changed from COLORS.dark
          },
          headerTintColor: COLORS.text, // Changed from COLORS.light to COLORS.text
          headerTitleStyle: {
            fontFamily: FONTS.bold,
          },
          contentStyle: { backgroundColor: COLORS.background }, // Changed from COLORS.dark
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Auto Organize Me' }}
        />
        <Stack.Screen
          name="CustomerList"
          component={CustomerListScreen}
          options={{ title: 'Customers' }}
        />
        <Stack.Screen
          name="AddEditCustomer"
          component={AddEditCustomerScreen}
          options={({ route }) => ({
            title: route.params?.customerId ? 'Edit Customer' : 'Add Customer',
          })}
        />
        {/* Add other screens here as we build them */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
