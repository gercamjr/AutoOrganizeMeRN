import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ScreenWrapper, AppButton, Card } from "../../components/common";
import PhotoCapture from "../../components/common/PhotoCapture";
import { COLORS, FONTS, SIZES } from "../../constants/theme";
import { getVehiclesForCustomer } from "../../database/database";

const VehicleListScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { customerId, customerName } = route.params || {};
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);

  const loadVehicles = useCallback(async () => {
    if (!customerId) return;
    setIsLoading(true);
    try {
      const fetchedVehicles = await getVehiclesForCustomer(customerId);
      setVehicles(fetchedVehicles);
    } catch (error) {
      Alert.alert("Error", "Failed to load vehicles.");
      console.error("Failed to load vehicles:", error);
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    loadVehicles();
    navigation.setOptions({
      title: customerName ? `${customerName}'s Vehicles` : "Vehicles",
    });
  }, [loadVehicles, customerName, navigation]);

  const renderVehicle = ({ item }) => (
    <Card style={styles.vehicleCard}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() =>
          setSelectedVehicleId(selectedVehicleId === item.id ? null : item.id)
        }
      >
        <Text style={styles.vehicleTitle}>
          {`${item.year || ""} ${item.make || ""} ${item.model || ""}`.trim()}
        </Text>
        <Text style={styles.vehicleDetail}>VIN: {item.vin || "N/A"}</Text>
        <Text style={styles.vehicleDetail}>
          Engine: {item.engineType || "N/A"}
        </Text>
      </TouchableOpacity>
      {selectedVehicleId === item.id && (
        <View style={styles.photoSection}>
          <Text style={styles.photoSectionTitle}>Vehicle Photos</Text>
          <PhotoCapture
            parentId={item.id}
            parentType="vehicle"
            onPhotosUpdate={(count) => {
              // Optionally handle photo count update
            }}
          />
        </View>
      )}
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
        {vehicles.length === 0 && !isLoading ? (
          <View style={styles.centeredMessageContainer}>
            <Text style={styles.noVehiclesText}>
              No vehicles found for this customer.
            </Text>
          </View>
        ) : (
          <FlatList
            data={vehicles}
            renderItem={renderVehicle}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContentContainer}
            showsVerticalScrollIndicator={false}
            refreshing={isLoading}
            onRefresh={loadVehicles}
          />
        )}
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
  },
  loadingText: {
    marginTop: SIZES.base,
    fontFamily: FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
  },
  noVehiclesText: {
    textAlign: "center",
    fontFamily: FONTS.regular,
    fontSize: SIZES.body3,
    color: COLORS.text,
    paddingHorizontal: SIZES.padding * 2,
  },
  listContentContainer: {
    paddingBottom: SIZES.padding,
  },
  vehicleCard: {
    marginBottom: SIZES.medium,
  },
  cardContent: {
    padding: SIZES.padding,
    flex: 1,
  },
  vehicleTitle: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  vehicleDetail: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    marginBottom: SIZES.base / 2,
  },
  photoSection: {
    marginTop: SIZES.base,
    padding: SIZES.base,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
  },
  photoSectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.font,
    color: COLORS.primary,
    marginBottom: SIZES.base,
  },
});

export default VehicleListScreen;
