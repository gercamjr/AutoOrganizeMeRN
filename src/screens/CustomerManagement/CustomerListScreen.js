import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ScreenWrapper, AppButton, Card } from '../../components/common';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { getCustomers, deleteCustomer } from '../../database/database';

const CustomerListScreen = () => {
  const navigation = useNavigation();
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

  const handleDeleteCustomer = (id) => {
    Alert.alert(
      'Delete Customer',
      'Are you sure you want to delete this customer and all associated data (vehicles, tasks, invoices, photos)? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await deleteCustomer(id);
              Alert.alert('Success', 'Customer deleted successfully.');
              loadCustomers(); // Refresh the list
            } catch (error) {
              Alert.alert('Error', `Failed to delete customer: ${error.message}`);
              console.error('Failed to delete customer:', error);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderCustomer = ({ item }) => (
    <Card style={styles.customerCard}>
      <TouchableOpacity onPress={() => handleEditCustomer(item)} style={styles.cardContent}>
        <Text style={styles.customerName}>{item.name}</Text>
        <Text style={styles.customerDetail}>Phone: {item.phone || 'N/A'}</Text>
        <Text style={styles.customerDetail}>Email: {item.email || 'N/A'}</Text>
        <Text style={styles.customerDetail}>Address: {item.address || 'N/A'}</Text>
      </TouchableOpacity>
      <View style={styles.buttonContainer}>
        <AppButton
          title="View Vehicles"
          onPress={() => navigation.navigate('VehicleList', { customerId: item.id, customerName: item.name })}
          style={styles.actionButton}
          textStyle={styles.actionButtonText}
          variant="info" // Or your desired variant
          size="small"
        />
        <AppButton
          title="Delete"
          onPress={() => handleDeleteCustomer(item.id)}
          style={styles.actionButton}
          textStyle={styles.actionButtonText}
          variant="error"
          size="small"
        />
      </View>
    </Card>
  );

  if (isLoading && customers.length === 0) {
    return (
      <ScreenWrapper>
        <View style={styles.centeredMessageContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading customers...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <AppButton
          title="Add New Customer"
          onPress={handleAddCustomer}
          style={styles.addButton}
          icon="plus-circle"
        />
        {customers.length === 0 && !isLoading && (
          <View style={styles.centeredMessageContainer}>
            <Text style={styles.noCustomersText}>No customers found. Tap "Add New Customer" to get started!</Text>
          </View>
        )}
        <FlatList
          data={customers}
          renderItem={renderCustomer}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContentContainer}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={loadCustomers}
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
  },
  centeredMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SIZES.base,
    fontFamily: FONTS.orbitronRegular, // Corrected font
    fontSize: SIZES.font,
    color: COLORS.textSecondary, // Adjusted for better visibility than lightGray if needed
  },
  addButton: {
    marginBottom: SIZES.padding,
    backgroundColor: COLORS.primary,
  },
  customerCard: {
    marginBottom: SIZES.medium,
    // Removed padding here if Card component handles it, or adjust as needed
  },
  cardContent: {
    padding: SIZES.padding, // Add padding here if not in Card
    flex: 1,
  },
  customerName: {
    fontFamily: FONTS.orbitronBold, // Changed from FONTS.bold
    fontSize: SIZES.large, // Changed from SIZES.h3 to be explicit
    color: COLORS.text, // Changed from COLORS.light
    marginBottom: SIZES.base,
  },
  customerDetail: {
    fontFamily: FONTS.orbitronRegular, // Changed from FONTS.regular
    fontSize: SIZES.font, // Changed from SIZES.body4
    color: COLORS.textSecondary, // Changed from COLORS.lightGray
    marginBottom: SIZES.base / 2,
  },
  deleteButton: { // This style might be redundant now if using actionButton
    // marginTop: SIZES.base,
  },
  deleteButtonText: { // This style might be redundant now if using actionButtonText
    // fontFamily: FONTS.orbitronSemiBold,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Or 'flex-end', 'space-between'
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding,
  },
  actionButton: {
    marginHorizontal: SIZES.base / 2, // Add some spacing between buttons
    flex: 1, // Make buttons take equal width if desired
  },
  actionButtonText: {
    fontFamily: FONTS.orbitronSemiBold,
    // color: COLORS.white, // Handled by AppButton variant
  },
  noCustomersText: {
    textAlign: 'center',
    fontFamily: FONTS.orbitronRegular, // Corrected font
    fontSize: SIZES.body3, // Kept SIZES.body3, can be increased if needed
    color: COLORS.text, // Changed from lightGray to text for better contrast
    paddingHorizontal: SIZES.padding * 2,
  },
  listContentContainer: {
    paddingBottom: SIZES.padding,
  },
});

export default CustomerListScreen;
