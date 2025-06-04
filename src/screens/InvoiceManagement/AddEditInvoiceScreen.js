import "react-native-get-random-values";
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Modal,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { v4 as uuidv4 } from "uuid";
import {
  ScreenWrapper,
  AppTextInput,
  AppButton,
  Card,
} from "../../components/common";
import { COLORS, FONTS, SIZES } from "../../constants/theme";
import { Picker } from "@react-native-picker/picker";
import {
  addInvoice,
  getInvoiceById,
  updateInvoice,
  getCustomers,
  getTasks,
} from "../../database/database";

const invoiceStatuses = ["Pending", "Paid", "Cancelled"];

const AddEditInvoiceScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const invoiceId = route.params?.invoiceId;
  const customerIdFromParams = route.params?.customerId;

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [customerId, setCustomerId] = useState(customerIdFromParams || "");
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date());
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState(invoiceStatuses[1]); // Default to "Pending"
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState([
    { description: "", quantity: "1", unitPrice: "0.00" },
  ]);
  const [customers, setCustomers] = useState([]); // For dropdown
  const [tasks, setTasks] = useState([]); // For adding tasks as line items
  const [customerSearchText, setCustomerSearchText] = useState("");
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedLineItemIndex, setSelectedLineItemIndex] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [datePickerFor, setDatePickerFor] = useState("invoiceDate"); // 'invoiceDate' or 'dueDate'

  const isEditing = invoiceId !== undefined;
  // Load customers for display
  useEffect(() => {
    loadCustomers();
  }, []);

  // Load tasks when customer is selected
  useEffect(() => {
    if (customerId) {
      loadTasksForCustomer();
      // Find and set the selected customer object
      const customer = customers.find((c) => c.id === customerId);
      setSelectedCustomer(customer);
    } else {
      setTasks([]);
      setSelectedCustomer(null);
    }
  }, [customerId, customers]);

  // Load invoice data if editing
  useEffect(() => {
    if (isEditing) {
      loadInvoiceData();
    } else {
      // Generate a unique invoice number for new invoices
      setInvoiceNumber(`INV-${Date.now().toString().slice(-6)}`);
    }
    if (customerIdFromParams) {
      setCustomerId(customerIdFromParams);
    }
  }, [invoiceId, customerIdFromParams, isEditing]);
  const loadCustomers = async () => {
    try {
      const fetchedCustomers = await getCustomers();
      setCustomers(fetchedCustomers);
    } catch (error) {
      console.error("Error loading customers:", error);
      Alert.alert("Error", "Failed to load customers.");
    }
  };

  const loadTasksForCustomer = async () => {
    if (!customerId) return;

    try {
      const fetchedTasks = await getTasks({ customerId });
      setTasks(fetchedTasks);
    } catch (error) {
      console.error("Error loading tasks for customer:", error);
      Alert.alert("Error", "Failed to load tasks for selected customer.");
    }
  };

  const loadInvoiceData = async () => {
    setIsLoading(true);
    try {
      const invoice = await getInvoiceById(invoiceId);
      if (invoice) {
        setInvoiceNumber(invoice.invoiceNumber || "");
        setCustomerId(invoice.customerId);
        setInvoiceDate(new Date(invoice.issueDate));
        setDueDate(new Date(invoice.dueDate));
        setStatus(invoice.paymentStatus || invoiceStatuses[1]);
        setNotes(invoice.notes || "");
        setLineItems(
          invoice.lineItems && invoice.lineItems.length > 0
            ? invoice.lineItems.map((item) => ({
                description: item.description,
                quantity: item.quantity.toString(),
                unitPrice: item.unitPrice.toString(),
              }))
            : [{ description: "", quantity: "1", unitPrice: "0.00" }]
        );
      } else {
        Alert.alert("Error", "Invoice not found.");
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error loading invoice:", error);
      Alert.alert("Error", "Failed to load invoice data.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleSaveInvoice = async () => {
    if (!customerId) {
      Alert.alert("Validation Error", "Please select a customer.");
      return;
    }
    if (
      lineItems.some(
        (item) =>
          !item.description.trim() ||
          parseFloat(item.quantity) <= 0 ||
          parseFloat(item.unitPrice) < 0
      )
    ) {
      Alert.alert(
        "Validation Error",
        "All line items must have a description, valid quantity, and unit price."
      );
      return;
    }

    setIsLoading(true);
    const calculatedAmount = lineItems.reduce(
      (sum, item) =>
        sum + parseFloat(item.quantity) * parseFloat(item.unitPrice),
      0
    );
    const invoiceData = {
      id: isEditing ? invoiceId : uuidv4(),
      invoiceNumber,
      customerId,
      taskId: null, // Optional: can be set if linking to a task
      issueDate: invoiceDate.toISOString(),
      dueDate: dueDate.toISOString(),
      totalAmount: calculatedAmount,
      paymentStatus: status,
      notes: notes.trim(),
      lineItems: lineItems.map((item) => ({
        description: item.description,
        quantity: parseFloat(item.quantity),
        unitPrice: parseFloat(item.unitPrice),
      })),
    };

    try {
      if (isEditing) {
        await updateInvoice(invoiceId, invoiceData);
        Alert.alert("Success", "Invoice updated successfully.");
      } else {
        await addInvoice(invoiceData);
        Alert.alert("Success", "Invoice added successfully.");
      }
      navigation.goBack();
    } catch (error) {
      console.error("Error saving invoice:", error);
      Alert.alert("Error", "Failed to save invoice.");
    } finally {
      setIsLoading(false);
    }
  };

  const showDatePicker = (pickerFor) => {
    setDatePickerFor(pickerFor);
    setDatePickerVisibility(true);
  };

  const onDateChange = (event, selectedDate) => {
    setDatePickerVisibility(false);
    if (selectedDate) {
      if (datePickerFor === "invoiceDate") {
        setInvoiceDate(selectedDate);
      } else {
        setDueDate(selectedDate);
      }
    }
  };

  const handleLineItemChange = (index, field, value) => {
    const newLineItems = [...lineItems];
    newLineItems[index][field] = value;
    setLineItems(newLineItems);
  };

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { description: "", quantity: "1", unitPrice: "0.00" },
    ]);
  };
  const removeLineItem = (index) => {
    const newLineItems = [...lineItems];
    newLineItems.splice(index, 1);
    setLineItems(newLineItems);
  };

  const handleCustomerSelect = (customer) => {
    setCustomerId(customer.id);
    setSelectedCustomer(customer);
    setCustomerSearchText("");
    setShowCustomerModal(false);
  };

  const handleTaskSelect = (task) => {
    if (selectedLineItemIndex !== null) {
      const newLineItems = [...lineItems];
      newLineItems[selectedLineItemIndex] = {
        description:
          task.title + (task.description ? ` - ${task.description}` : ""),
        quantity: "1",
        unitPrice: "0.00",
      };
      setLineItems(newLineItems);
    }
    setShowTaskModal(false);
    setSelectedLineItemIndex(null);
  };

  const openTaskSelector = (index) => {
    if (!customerId) {
      Alert.alert(
        "Please Select Customer",
        "You must select a customer first to view their tasks."
      );
      return;
    }
    if (tasks.length === 0) {
      Alert.alert("No Tasks Found", "This customer has no tasks available.");
      return;
    }
    setSelectedLineItemIndex(index);
    setShowTaskModal(true);
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(customerSearchText.toLowerCase())
  );

  const calculatedTotalAmount = lineItems.reduce((sum, item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unitPrice) || 0;
    return sum + quantity * unitPrice;
  }, 0);
  if (isLoading && isEditing) {
    return (
      <ScreenWrapper>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
        >
          <Card style={styles.card}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading invoice...</Text>
            </View>
          </Card>
        </ScrollView>
      </ScreenWrapper>
    );
  }
  return (
    <ScreenWrapper>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.card}>
          <TouchableOpacity
            style={styles.customerSelector}
            onPress={() => setShowCustomerModal(true)}
            disabled={isLoading}
          >
            <Text style={styles.label}>Customer</Text>
            <View style={styles.customerSelectorContent}>
              <Text
                style={[
                  styles.customerSelectorText,
                  !selectedCustomer && styles.placeholderText,
                ]}
              >
                {selectedCustomer
                  ? selectedCustomer.name
                  : "Select a customer..."}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.spacer} />
          <AppTextInput
            label="Invoice Number"
            value={invoiceNumber}
            onChangeText={setInvoiceNumber}
            placeholder="Invoice number (auto-generated)"
            disabled={isLoading}
          />
          <TouchableOpacity onPress={() => showDatePicker("invoiceDate")}>
            <AppTextInput
              label="Invoice Date"
              value={invoiceDate.toLocaleDateString()}
              placeholder="Select invoice date"
              editable={false}
              disabled={isLoading}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => showDatePicker("dueDate")}>
            <AppTextInput
              label="Due Date"
              value={dueDate.toLocaleDateString()}
              placeholder="Select due date"
              editable={false}
              disabled={isLoading}
            />
          </TouchableOpacity>
          <Text style={styles.sectionTitle}>Line Items</Text>
          {lineItems.map((item, index) => (
            <View key={index} style={styles.lineItemContainer}>
              <View style={styles.descriptionRow}>
                <AppTextInput
                  label="Description"
                  value={item.description}
                  onChangeText={(text) =>
                    handleLineItemChange(index, "description", text)
                  }
                  placeholder="Enter item description"
                  disabled={isLoading}
                  style={styles.descriptionInput}
                />
                <TouchableOpacity
                  style={styles.taskSelectorButton}
                  onPress={() => openTaskSelector(index)}
                  disabled={isLoading || !customerId}
                >
                  <Text style={styles.taskSelectorButtonText}>
                    {customerId && tasks.length > 0
                      ? "Select Task"
                      : "No Tasks"}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.lineItemRow}>
                <AppTextInput
                  label="Quantity"
                  value={item.quantity}
                  onChangeText={(text) =>
                    handleLineItemChange(index, "quantity", text)
                  }
                  placeholder="Qty"
                  keyboardType="numeric"
                  style={styles.lineItemInputSmall}
                  disabled={isLoading}
                />
                <AppTextInput
                  label="Unit Price"
                  value={item.unitPrice}
                  onChangeText={(text) =>
                    handleLineItemChange(index, "unitPrice", text)
                  }
                  placeholder="Price"
                  keyboardType="numeric"
                  style={styles.lineItemInputSmall}
                  disabled={isLoading}
                />
                <TouchableOpacity
                  onPress={() => removeLineItem(index)}
                  style={styles.removeButton}
                  disabled={isLoading}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <AppButton
            title="Add Line Item"
            onPress={addLineItem}
            variant="outline"
            style={styles.addLineButton}
            disabled={isLoading}
          />
          <Text style={styles.totalAmountText}>
            Total Amount: ${calculatedTotalAmount.toFixed(2)}
          </Text>
          <Text style={styles.label}>Payment Status</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={status}
              onValueChange={(itemValue) => setStatus(itemValue)}
              style={styles.picker}
              itemStyle={styles.pickerItem}
              prompt="Select Payment Status"
              enabled={!isLoading}
            >
              {invoiceStatuses.map((invoiceStatus) => (
                <Picker.Item
                  key={invoiceStatus}
                  label={invoiceStatus}
                  value={invoiceStatus}
                />
              ))}
            </Picker>
          </View>
          <AppTextInput
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Additional notes (optional)"
            multiline
            numberOfLines={3}
            disabled={isLoading}
          />
          <AppButton
            title={isEditing ? "Update Invoice" : "Add Invoice"}
            onPress={handleSaveInvoice}
            disabled={isLoading}
            style={styles.saveButton}
          />
        </Card>
      </ScrollView>

      {/* Customer Selection Modal */}
      <Modal
        visible={showCustomerModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCustomerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Customer</Text>
            <AppTextInput
              placeholder="Search customers..."
              value={customerSearchText}
              onChangeText={setCustomerSearchText}
              style={styles.searchInput}
            />
            <FlatList
              data={filteredCustomers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.customerItem}
                  onPress={() => handleCustomerSelect(item)}
                >
                  <Text style={styles.customerName}>{item.name}</Text>
                  <Text style={styles.customerDetails}>
                    {item.phone || "No phone"} • {item.email || "No email"}
                  </Text>
                </TouchableOpacity>
              )}
              style={styles.customerList}
            />
            <AppButton
              title="Cancel"
              onPress={() => setShowCustomerModal(false)}
              variant="outline"
              style={styles.modalCancelButton}
            />
          </View>
        </View>
      </Modal>

      {/* Task Selection Modal */}
      <Modal
        visible={showTaskModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTaskModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Task</Text>
            <FlatList
              data={tasks}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.taskItem}
                  onPress={() => handleTaskSelect(item)}
                >
                  <Text style={styles.taskTitle}>{item.title}</Text>
                  <Text style={styles.taskDetails}>{item.status}</Text>
                  {item.description && (
                    <Text style={styles.taskDescription}>
                      {item.description}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
              style={styles.taskList}
            />
            <AppButton
              title="Cancel"
              onPress={() => setShowTaskModal(false)}
              variant="outline"
              style={styles.modalCancelButton}
            />
          </View>
        </View>
      </Modal>
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
  sectionTitle: {
    fontFamily: FONTS.orbitronSemiBold,
    fontSize: SIZES.large,
    color: COLORS.text,
    marginTop: SIZES.padding,
    marginBottom: SIZES.base,
  },
  lineItemContainer: {
    marginBottom: SIZES.base,
    padding: SIZES.base,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: SIZES.base,
    backgroundColor: COLORS.surface,
  },
  lineItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: SIZES.base,
  },
  lineItemInputSmall: {
    flex: 1,
    marginRight: SIZES.base,
  },
  removeButton: {
    padding: SIZES.base,
    backgroundColor: COLORS.error,
    borderRadius: SIZES.base,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
  },
  removeButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.orbitronSemiBold,
    fontSize: SIZES.small,
  },
  addLineButton: {
    marginVertical: SIZES.base,
  },
  totalAmountText: {
    fontFamily: FONTS.orbitronBold,
    fontSize: SIZES.large,
    color: COLORS.primary,
    textAlign: "right",
    marginVertical: SIZES.padding,
    paddingVertical: SIZES.base,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  saveButton: {
    marginTop: 20,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 200,
  },
  loadingText: {
    marginTop: SIZES.base,
    color: COLORS.text,
    fontFamily: FONTS.orbitronRegular,
  },
  customerSelector: {
    marginBottom: SIZES.padding,
  },
  label: {
    fontSize: SIZES.small,
    fontFamily: FONTS.orbitronMedium,
    color: COLORS.textSecondary,
    marginBottom: SIZES.extraSmall,
    marginLeft: SIZES.tiny,
  },
  customerSelectorContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.medium,
    minHeight: 50,
  },
  customerSelectorText: {
    flex: 1,
    fontSize: SIZES.medium,
    fontFamily: FONTS.orbitronRegular,
    color: COLORS.text,
  },
  placeholderText: {
    color: COLORS.textSecondary,
  },
  dropdownIcon: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginLeft: SIZES.base,
  },
  descriptionRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: SIZES.base,
  },
  descriptionInput: {
    flex: 1,
    marginRight: SIZES.base,
    marginBottom: 0,
  },
  taskSelectorButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.small,
    borderRadius: SIZES.base,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  taskSelectorButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.orbitronMedium,
    fontSize: SIZES.small,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.medium,
    padding: SIZES.padding,
    margin: SIZES.padding,
    maxHeight: "80%",
    minWidth: "80%",
  },
  modalTitle: {
    fontSize: SIZES.large,
    fontFamily: FONTS.orbitronBold,
    color: COLORS.text,
    textAlign: "center",
    marginBottom: SIZES.padding,
  },
  searchInput: {
    marginBottom: SIZES.base,
  },
  customerList: {
    maxHeight: 300,
    marginBottom: SIZES.base,
  },
  customerItem: {
    padding: SIZES.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  customerName: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.orbitronMedium,
    color: COLORS.text,
    marginBottom: SIZES.tiny,
  },
  customerDetails: {
    fontSize: SIZES.small,
    fontFamily: FONTS.orbitronRegular,
    color: COLORS.textSecondary,
  },
  taskList: {
    maxHeight: 300,
    marginBottom: SIZES.base,
  },
  taskItem: {
    padding: SIZES.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  taskTitle: {
    fontSize: SIZES.medium,
    fontFamily: FONTS.orbitronMedium,
    color: COLORS.text,
    marginBottom: SIZES.tiny,
  },
  taskDetails: {
    fontSize: SIZES.small,
    fontFamily: FONTS.orbitronRegular,
    color: COLORS.textSecondary,
    marginBottom: SIZES.tiny,
  },
  taskDescription: {
    fontSize: SIZES.small,
    fontFamily: FONTS.orbitronRegular,
    color: COLORS.textSecondary,
    fontStyle: "italic",
  },
  modalCancelButton: {
    marginTop: SIZES.base,
  },
  pickerContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.medium,
    marginBottom: SIZES.padding,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
  },
  picker: {
    height: 50,
    color: COLORS.text,
    backgroundColor: "transparent",
  },
  pickerItem: {
    fontFamily: FONTS.orbitronRegular,
  },
  spacer: {
    height: SIZES.base,
  },
});

export default AddEditInvoiceScreen;
