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
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { ScreenWrapper, AppButton, Card } from "../../components/common";
import { COLORS, FONTS, SIZES } from "../../constants/theme";
import { getInvoices, deleteInvoice } from "../../database/database";

const InvoiceListScreen = ({ route }) => {
  const navigation = useNavigation();
  const { customerId, customerName } = route.params || {}; // Optional: Filter invoices by customer
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadInvoices = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters = customerId ? { customerId } : {};
      const fetchedInvoices = await getInvoices(filters);
      setInvoices(fetchedInvoices);
    } catch (error) {
      Alert.alert("Error", "Failed to load invoices.");
      console.error("Failed to load invoices:", error);
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  useFocusEffect(
    useCallback(() => {
      loadInvoices();
      if (customerName) {
        navigation.setOptions({ title: `${customerName}'s Invoices` });
      } else {
        navigation.setOptions({ title: "All Invoices" });
      }
    }, [loadInvoices, customerName, navigation])
  );

  const handleAddInvoice = () => {
    navigation.navigate("AddEditInvoice", { customerId }); // Pass customerId if available
  };

  const handleEditInvoice = (invoice) => {
    navigation.navigate("AddEditInvoice", {
      invoiceId: invoice.id,
      customerId,
    });
  };

  const handleDeleteInvoice = (id) => {
    Alert.alert(
      "Delete Invoice",
      "Are you sure you want to delete this invoice? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              await deleteInvoice(id);
              Alert.alert("Success", "Invoice deleted successfully.");
              loadInvoices(); // Refresh the list
            } catch (error) {
              Alert.alert(
                "Error",
                `Failed to delete invoice: ${error.message}`
              );
              console.error("Failed to delete invoice:", error);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };
  const renderInvoice = ({ item }) => (
    <Card style={styles.invoiceCard}>
      <TouchableOpacity
        onPress={() => handleEditInvoice(item)}
        style={styles.cardContent}
      >
        <Text style={styles.invoiceTitle}>
          Invoice #{item.invoiceNumber || `ID-${item.id.substring(0, 8)}`}
        </Text>
        <Text style={styles.invoiceDetail}>
          Customer: {item.customerName || "N/A"}
        </Text>
        <Text style={styles.invoiceDetail}>
          Date: {new Date(item.issueDate).toLocaleDateString()}
        </Text>
        <Text style={styles.invoiceDetail}>
          Amount: ${item.totalAmount ? item.totalAmount.toFixed(2) : "0.00"}
        </Text>
        <Text style={styles.invoiceDetail}>
          Status: {item.paymentStatus || "Pending"}
        </Text>
      </TouchableOpacity>
      <View style={styles.buttonContainer}>
        <AppButton
          title="Delete"
          onPress={() => handleDeleteInvoice(item.id)}
          style={styles.actionButton}
          textStyle={styles.actionButtonText}
          variant="error"
          size="small"
        />
      </View>
    </Card>
  );

  if (isLoading && invoices.length === 0) {
    return (
      <ScreenWrapper>
        <View style={styles.centeredMessageContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading Invoices...</Text>
        </View>
      </ScreenWrapper>
    );
  }
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <AppButton
          title="Add New Invoice"
          onPress={handleAddInvoice}
          style={styles.addButton}
          icon="plus-circle"
        />
        {invoices.length === 0 && !isLoading && (
          <View style={styles.centeredMessageContainer}>
            <Text style={styles.noDataText}>
              No invoices found. Tap "Add New Invoice" to get started!
            </Text>
          </View>
        )}
        <FlatList
          data={invoices}
          renderItem={renderInvoice}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContentContainer}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={loadInvoices}
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
  noDataText: {
    textAlign: "center",
    fontFamily: FONTS.orbitronRegular,
    fontSize: SIZES.body3,
    color: COLORS.text,
    paddingHorizontal: SIZES.padding * 2,
  },
  listContentContainer: {
    paddingBottom: SIZES.padding,
  },
  invoiceCard: {
    marginBottom: SIZES.medium,
  },
  cardContent: {
    padding: SIZES.padding,
    flex: 1,
  },
  invoiceTitle: {
    fontFamily: FONTS.orbitronBold,
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  invoiceDetail: {
    fontFamily: FONTS.orbitronRegular,
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    marginBottom: SIZES.base / 2,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding,
  },
  actionButton: {
    marginHorizontal: SIZES.base / 2,
  },
  actionButtonText: {
    fontFamily: FONTS.orbitronSemiBold,
  },
});

export default InvoiceListScreen;
