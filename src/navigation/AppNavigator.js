import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import CustomerListScreen from "../screens/CustomerManagement/CustomerListScreen";
import AddEditCustomerScreen from "../screens/CustomerManagement/AddEditCustomerScreen";
import VehicleListScreen from "../screens/VehicleManagement/VehicleListScreen";
import AddEditVehicleScreen from "../screens/VehicleManagement/AddEditVehicleScreen";
import AllVehiclesListScreen from "../screens/VehicleManagement/AllVehiclesListScreen"; // Added
import TaskListScreen from "../screens/TaskManagement/TaskListScreen"; // Added
import AddEditTaskScreen from "../screens/TaskManagement/AddEditTaskScreen"; // Added
import InvoiceListScreen from "../screens/InvoiceManagement/InvoiceListScreen"; // Added
import AddEditInvoiceScreen from "../screens/InvoiceManagement/AddEditInvoiceScreen"; // Added
import { COLORS, FONTS } from "../constants/theme";

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
          options={{ title: "Auto Organize Me" }}
        />
        <Stack.Screen
          name="CustomerList"
          component={CustomerListScreen}
          options={{ title: "Customers" }}
        />
        <Stack.Screen
          name="AddEditCustomer"
          component={AddEditCustomerScreen}
          options={({ route }) => ({
            title: route.params?.customerId ? "Edit Customer" : "Add Customer",
          })}
        />
        <Stack.Screen
          name="VehicleList"
          component={VehicleListScreen}
          options={({ route }) => ({
            title: route.params?.customerName
              ? `${route.params.customerName}'s Vehicles`
              : "Vehicles",
          })}
        />
        <Stack.Screen
          name="AddEditVehicle"
          component={AddEditVehicleScreen}
          // Title for this screen is set dynamically within the component itself
        />
        <Stack.Screen // Added AllVehiclesListScreen
          name="AllVehiclesList"
          component={AllVehiclesListScreen}
          options={{ title: "All Vehicles" }}
        />
        {/* Task Management Screens */}
        <Stack.Screen
          name="TaskList"
          component={TaskListScreen}
          options={{ title: "Tasks" }}
        />
        <Stack.Screen
          name="AddEditTask"
          component={AddEditTaskScreen}
          options={({ route }) => ({
            title: route.params?.taskId ? "Edit Task" : "Add Task",
          })}
        />
        {/* Invoice Management Screens */}
        <Stack.Screen
          name="InvoiceList"
          component={InvoiceListScreen}
          // options={{ title: 'Invoices' }} // Title is set dynamically in InvoiceListScreen
        />
        <Stack.Screen
          name="AddEditInvoice"
          component={AddEditInvoiceScreen}
          options={({ route }) => ({
            title: route.params?.invoiceId ? "Edit Invoice" : "Add Invoice",
          })}
        />
        {/* Add other screens here as we build them */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
