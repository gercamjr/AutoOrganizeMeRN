import React, { useState,  useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenWrapper, AppButton, Card } from '../../components/common';
import { theme } from '../../constants/theme';
import { getCustomers, deleteCustomer } from '../../database/database';
import { globalStyles } from '../../styles/globalStyles';

const CustomerListScreen = ({ navigation }) => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedCustomers = await getCustomers();
      setCustomers(fetchedCustomers);
    } catch (error) {
      Alert.alert('Error', 'Failed to load customers.');
      console.error('Failed to load customers:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCustomers();
    }, [loadCustomers])
  );

  const handleAddCustomer = () => {
    navigation.navigate('AddEditCustomer');
  };

  const handleEditCustomer = (customer) => {
    navigation.navigate('AddEditCustomer', { customerId: customer.id });
  };

  const handleDeleteCustomer = async (id) => {
    Alert.alert(
      'Delete Customer',
      'Are you sure you want to delete this customer and all their vehicles? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCustomer(id);
              Alert.alert('Success', 'Customer deleted successfully.');
              loadCustomers(); // Refresh the list
            } catch (error) {
              Alert.alert('Error', 'Failed to delete customer.');
              console.error('Failed to delete customer:', error);
            }
          },
        },
      ]
    );
  };

  const renderCustomer = ({ item }) => (
    <Card style={styles.customerCard}>
      <TouchableOpacity onPress={() => handleEditCustomer(item)} style={styles.cardContent}>
        <Text style={[globalStyles.text, styles.customerName]}>{item.name}</Text>
        <Text style={[globalStyles.text, styles.customerDetail]}>Phone: {item.phone || 'N/A'}</Text>
        <Text style={[globalStyles.text, styles.customerDetail]}>Email: {item.email || 'N/A'}</Text>
        <Text style={[globalStyles.text, styles.customerDetail]}>Address: {item.address || 'N/A'}</Text>
      </TouchableOpacity>
      <AppButton
        title="Delete"
        onPress={() => handleDeleteCustomer(item.id)}
        style={styles.deleteButton}
        textStyle={styles.deleteButtonText}
        variant="danger"
      />
    </Card>
  );

  return (
    <ScreenWrapper>
      <View style={globalStyles.container}>
        <Text style={globalStyles.title}>Customers</Text>
        <AppButton
          title="Add New Customer"
          onPress={handleAddCustomer}
          style={styles.addButton}
        />
        {isLoading && <Text style={globalStyles.text}>Loading customers...</Text>}
        {!isLoading && customers.length === 0 && (
          <Text style={[globalStyles.text, styles.noCustomersText]}>No customers found. Add one to get started!</Text>
        )}
        <FlatList
          data={customers}
          renderItem={renderCustomer}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContentContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  addButton: {
    marginBottom: theme.spacing.large,
  },
  customerCard: {
    marginBottom: theme.spacing.medium,
    padding: theme.spacing.medium,
  },
  cardContent: {
    flex: 1,
  },
  customerName: {
    fontSize: theme.typography.fontSize.large,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.small,
  },
  customerDetail: {
    fontSize: theme.typography.fontSize.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.extraSmall,
  },
  deleteButton: {
    marginTop: theme.spacing.medium,
    backgroundColor: theme.colors.error, // Ensure this is defined in your theme or use a default
    paddingVertical: theme.spacing.small,
  },
  deleteButtonText: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.bold,
  },
  noCustomersText: {
    textAlign: 'center',
    marginTop: theme.spacing.large,
    fontSize: theme.typography.fontSize.medium,
  },
  listContentContainer: {
    paddingBottom: theme.spacing.large,
  },
});

export default CustomerListScreen;
