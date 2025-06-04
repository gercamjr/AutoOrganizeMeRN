import "react-native-get-random-values";
import { useState, useEffect } from "react";
import { StyleSheet, ScrollView, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { v4 as uuidv4 } from "uuid";
import {
  ScreenWrapper,
  AppTextInput,
  AppButton,
  Card,
} from "../../components/common";
import {
  addCustomer,
  getCustomerById,
  updateCustomer,
} from "../../database/database";

const AddEditCustomerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const customerId = route.params?.customerId;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = customerId !== undefined;

  useEffect(() => {
    if (isEditing) {
      loadCustomerData();
    }
  }, [customerId]);

  const loadCustomerData = async () => {
    setIsLoading(true);
    try {
      const customer = await getCustomerById(customerId);
      if (customer) {
        setName(customer.name);
        setPhone(customer.phone || "");
        setEmail(customer.email || "");
        setAddress(customer.address || "");
      } else {
        Alert.alert("Error", "Customer not found.");
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error loading customer:", error);
      Alert.alert("Error", "Failed to load customer data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCustomer = async () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Customer name is required.");
      return;
    }

    setIsLoading(true);
    console.log(
      `[AddEditCustomerScreen] handleSaveCustomer: isEditing = ${isEditing}, customerId = ${customerId}`
    );

    let newId;
    if (!isEditing) {
      console.log(
        "[AddEditCustomerScreen] handleSaveCustomer: About to call uuidv4. Type:",
        typeof uuidv4
      );
      try {
        newId = uuidv4();
        console.log(
          "[AddEditCustomerScreen] handleSaveCustomer: uuidv4 call successful, newId:",
          newId
        );
      } catch (e) {
        console.error(
          "[AddEditCustomerScreen] handleSaveCustomer: Error calling uuidv4:",
          e.message,
          e.stack
        );
        Alert.alert(
          "Critical Error",
          "Failed to generate unique ID. Cannot save customer."
        );
        setIsLoading(false);
        return;
      }
    }

    const customerData = {
      id: isEditing ? customerId : newId,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
    };
    console.log(
      "[AddEditCustomerScreen] handleSaveCustomer: Customer data prepared:",
      JSON.stringify(customerData)
    );

    try {
      if (isEditing) {
        console.log(
          "[AddEditCustomerScreen] handleSaveCustomer: Calling updateCustomer"
        );
        const changes = await updateCustomer(customerId, customerData);
        console.log(
          "[AddEditCustomerScreen] handleSaveCustomer: updateCustomer result (changes):",
          changes
        );
        if (changes > 0) {
          Alert.alert("Success", "Customer updated successfully.");
          navigation.goBack();
        } else {
          Alert.alert("Info", "No changes were made to the customer details.");
          // navigation.goBack(); // Optionally go back even if no changes
        }
      } else {
        console.log(
          "[AddEditCustomerScreen] handleSaveCustomer: Calling addCustomer"
        );
        const success = await addCustomer(customerData);
        console.log(
          "[AddEditCustomerScreen] handleSaveCustomer: addCustomer result (success):",
          success
        );
        if (success) {
          Alert.alert("Success", "Customer added successfully.");
          navigation.goBack();
        } else {
          // This case should ideally be handled by an error throw in addCustomer
          Alert.alert(
            "Error",
            "Failed to add customer. The operation reported no success."
          );
        }
      }
    } catch (error) {
      console.error(
        "[AddEditCustomerScreen] Error saving customer: %s, Stack: %s",
        error.message,
        error.stack
      );
      Alert.alert("Error", `Failed to save customer: ${error.message}`);
    } finally {
      setIsLoading(false);
      console.log(
        "[AddEditCustomerScreen] handleSaveCustomer: Finished, isLoading set to false."
      );
    }
  };
  return (
    <ScreenWrapper>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.card}>
          <AppTextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter customer's full name"
            disabled={isLoading}
          />
          <AppTextInput
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter phone number (optional)"
            keyboardType="phone-pad"
            disabled={isLoading}
          />
          <AppTextInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email address (optional)"
            keyboardType="email-address"
            autoCapitalize="none"
            disabled={isLoading}
          />
          <AppTextInput
            label="Address"
            value={address}
            onChangeText={setAddress}
            placeholder="Enter address (optional)"
            multiline
            numberOfLines={3}
            disabled={isLoading}
          />
          <AppButton
            title={isEditing ? "Update Customer" : "Add Customer"}
            onPress={handleSaveCustomer}
            disabled={isLoading}
            style={styles.saveButton}
          />
        </Card>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  card: {
    margin: 0,
    padding: 16,
    borderRadius: 0,
    flex: 1,
  },
  saveButton: {
    marginTop: 20,
  },
});

export default AddEditCustomerScreen;
