import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { v4 as uuidv4 } from 'uuid';
import { ScreenWrapper, AppTextInput, AppButton, Card } from '../../components/common';
import { COLORS, FONTS } from '../../constants/theme';
import { addCustomer, getCustomerById, updateCustomer } from '../../database/database';

const AddEditCustomerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const customerId = route.params?.customerId;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
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
        setPhone(customer.phone || '');
        setEmail(customer.email || '');
        setAddress(customer.address || '');
      } else {
        Alert.alert('Error', 'Customer not found.');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading customer:', error);
      Alert.alert('Error', 'Failed to load customer data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCustomer = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Customer name is required.');
      return;
    }

    setIsLoading(true);
    const customerData = {
      id: isEditing ? customerId : uuidv4(),
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
    };

    try {
      if (isEditing) {
        await updateCustomer(customerId, customerData);
        Alert.alert('Success', 'Customer updated successfully.');
      } else {
        await addCustomer(customerData);
        Alert.alert('Success', 'Customer added successfully.');
      }
      navigation.goBack();
    } catch (error) {
      console.error('Error saving customer:', error);
      Alert.alert('Error', `Failed to save customer: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
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
            title={isEditing ? 'Update Customer' : 'Add Customer'}
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
  card: {
    margin: 16,
    padding: 16,
  },
  saveButton: {
    marginTop: 20,
  },
});

export default AddEditCustomerScreen;
