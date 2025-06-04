import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { ScreenWrapper, AppButton, Card } from "../../components/common";
import { COLORS, FONTS, SIZES } from "../../constants/theme";
import { getVehiclesForCustomer, deleteVehicle } from "../../database/database";

const VehicleListScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { customerId, customerName } = route.params || {}; // Add fallback to empty object

  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Early return if required params are missing
  if (!customerId || !customerName) {
    return (
      <ScreenWrapper>
        <View style={styles.centeredMessageContainer}>
          <Text style={styles.errorText}>
            Missing customer information. Please go back and try again.
          </Text>
          <AppButton
            title="Go Back"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
        </View>
      </ScreenWrapper>
    );
  }
  const loadVehicles = useCallback(async () => {
    if (!customerId) {
      Alert.alert("Error", "No customer ID provided.");
      console.error("loadVehicles: customerId is missing from route params");
      return;
    }

    setIsLoading(true);
    try {
      console.log(`Loading vehicles for customer: ${customerId}`);
      const fetchedVehicles = await getVehiclesForCustomer(customerId);
      setVehicles(fetchedVehicles);
    } catch (error) {
      Alert.alert("Error", `Failed to load vehicles for ${customerName}.`);
      console.error(
        `Failed to load vehicles for customer ${customerId}:`,
        error
      );
    } finally {
      setIsLoading(false);
    }
  }, [customerId, customerName]);

  useFocusEffect(
    useCallback(() => {
      loadVehicles();
    }, [loadVehicles])
  );

  const handleAddVehicle = () => {
    navigation.navigate("AddEditVehicle", { customerId, customerName });
  };

  const handleEditVehicle = (vehicle) => {
    navigation.navigate("AddEditVehicle", {
      customerId,
      customerName,
      vehicleId: vehicle.id,
    });
  };

  const handleDeleteVehicle = (id) => {
    Alert.alert(
      "Delete Vehicle",
      "Are you sure you want to delete this vehicle and all associated data? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              await deleteVehicle(id);
              Alert.alert("Success", "Vehicle deleted successfully.");
              loadVehicles(); // Refresh the list
            } catch (error) {
              Alert.alert(
                "Error",
                `Failed to delete vehicle: ${error.message}`
              );
              console.error("Failed to delete vehicle:", error);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderVehicle = ({ item }) => (
    <Card style={styles.vehicleCard}>
      <TouchableOpacity
        onPress={() => handleEditVehicle(item)}
        style={styles.cardContent}
      >
        <Text style={styles.vehicleName}>
          {item.year} {item.make} {item.model}
        </Text>
        <Text style={styles.vehicleDetail}>VIN: {item.vin || "N/A"}</Text>
        <Text style={styles.vehicleDetail}>
          Engine: {item.engineType || "N/A"}
        </Text>
      </TouchableOpacity>
      <AppButton
        title="Delete"
        onPress={() => handleDeleteVehicle(item.id)}
        style={styles.deleteButton}
        textStyle={styles.deleteButtonText}
        variant="error" // Using error variant for delete
        size="small"
      />
    </Card>
  );

  if (isLoading && vehicles.length === 0) {
    return (
      <ScreenWrapper>
        <View style={styles.centeredMessageContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading vehicles...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <AppButton
          title={`Add Vehicle for ${customerName}`}
          onPress={handleAddVehicle}
          style={styles.addButton}
          icon="plus-circle"
        />
        {vehicles.length === 0 && !isLoading && (
          <View style={styles.centeredMessageContainer}>
            <Text style={styles.noItemsText}>
              No vehicles found for {customerName}. Tap "Add Vehicle" to get
              started!
            </Text>
          </View>
        )}
        <FlatList
          data={vehicles}
          renderItem={renderVehicle}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContentContainer}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={loadVehicles}
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SIZES.padding * 2,
  },
  loadingText: {
    marginTop: SIZES.base,
    fontFamily: FONTS.orbitronRegular,
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
  },
  addButton: {
    marginBottom: SIZES.padding,
    backgroundColor: COLORS.primary,
  },
  vehicleCard: {
    marginBottom: SIZES.medium,
  },
  cardContent: {
    flex: 1,
  },
  vehicleName: {
    fontFamily: FONTS.orbitronBold,
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  vehicleDetail: {
    fontFamily: FONTS.orbitronRegular,
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    marginBottom: SIZES.base / 2,
  },
  deleteButton: {
    marginTop: SIZES.base,
    // backgroundColor: COLORS.error, // AppButton variant handles this
  },
  deleteButtonText: {
    // color: COLORS.white, // AppButton variant handles this
    fontFamily: FONTS.orbitronSemiBold,
  },
  noItemsText: {
    textAlign: "center",
    fontFamily: FONTS.orbitronRegular,
    fontSize: SIZES.body3,
    color: COLORS.text,
  },
  listContentContainer: {
    paddingBottom: SIZES.padding,
  },
  errorText: {
    textAlign: "center",
    fontFamily: FONTS.orbitronRegular,
    fontSize: SIZES.font,
    color: COLORS.error,
    marginBottom: SIZES.padding,
    paddingHorizontal: SIZES.padding,
  },
  backButton: {
    marginTop: SIZES.base,
  },
});

export default VehicleListScreen;
