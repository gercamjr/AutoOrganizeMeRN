import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import ScreenWrapper from "../../components/common/ScreenWrapper";
import AppTextInput from "../../components/common/AppTextInput";
import AppButton from "../../components/common/AppButton";
import Card from "../../components/common/Card"; // Import Card
import { COLORS, FONTS, SIZES } from "../../constants/theme"; // Import SIZES, FONTS, COLORS directly
import { Picker } from "@react-native-picker/picker";
import {
  getCustomers,
  getVehiclesForCustomer,
  getTaskById,
  addTask,
  updateTask,
  deleteTask,
} from "../../database/database";
import { Ionicons } from "@expo/vector-icons";

const taskCategories = ["Repairs", "Maintenance", "Diagnostics"];
const taskStatuses = [
  "To Do",
  "In Progress",
  "Awaiting Parts",
  "On Hold",
  "Completed",
  "Cancelled",
  "Requires Follow-up",
];

const AddEditTaskScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const taskId = route.params?.taskId;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(taskCategories[0]);
  const [selectedStatus, setSelectedStatus] = useState(taskStatuses[0]);
  const [dueDate, setDueDate] = useState("");

  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [customerVehiclesLoading, setCustomerVehiclesLoading] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: taskId ? "Edit Task" : "Add New Task" });
  }, [navigation, taskId]);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedCustomers = await getCustomers();
      setCustomers(fetchedCustomers || []);

      if (taskId) {
        const task = await getTaskById(taskId);
        if (task) {
          setTitle(task.title);
          setDescription(task.description || "");
          setSelectedCustomerId(task.customerId);
          // Vehicle will be loaded by customerId effect, store original for re-selection
          // route.params.originalVehicleId = task.vehicleId;
          // route.params.originalCustomerId = task.customerId;
          setSelectedCategory(task.category || taskCategories[0]);
          setSelectedStatus(task.status || taskStatuses[0]);
          setDueDate(task.dueDate || "");
        } else {
          Alert.alert("Error", "Task not found. It may have been deleted.");
          navigation.goBack();
        }
      }
    } catch (error) {
      console.error("Error loading initial data for task screen:", error);
      Alert.alert("Error", "Failed to load necessary data. Please try again.");
      navigation.goBack();
    }
    setIsLoading(false);
  }, [taskId, navigation]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    const loadVehicles = async () => {
      if (selectedCustomerId) {
        setCustomerVehiclesLoading(true);
        setVehicles([]);
        // setSelectedVehicleId(null); // Reset vehicle selection when customer changes

        try {
          const fetchedVehicles = await getVehiclesForCustomer(
            selectedCustomerId
          );
          setVehicles(fetchedVehicles || []);

          // Attempt to re-select vehicle if editing and customer matches original task customer
          if (taskId) {
            const task = await getTaskById(taskId); // Re-fetch to ensure fresh data
            if (task && task.customerId === selectedCustomerId) {
              setSelectedVehicleId(task.vehicleId);
            } else {
              setSelectedVehicleId(null); // Customer changed or task has no vehicle for this customer
            }
          } else if (fetchedVehicles && fetchedVehicles.length > 0) {
            // For new tasks, optionally auto-select first vehicle or leave null
            // setSelectedVehicleId(fetchedVehicles[0].id);
          } else {
            setSelectedVehicleId(null);
          }
        } catch (error) {
          console.error("Error loading vehicles for customer:", error);
          Alert.alert(
            "Error",
            "Failed to load vehicles for the selected customer."
          );
        }
        setCustomerVehiclesLoading(false);
      } else {
        setVehicles([]); // Clear vehicles if no customer is selected
        setSelectedVehicleId(null);
      }
    };

    loadVehicles();
  }, [selectedCustomerId, taskId]);

  const handleSaveTask = async () => {
    if (!title.trim()) {
      Alert.alert("Validation Error", "Task Title is required.");
      return;
    }
    if (!selectedCustomerId) {
      Alert.alert("Validation Error", "Please select a customer.");
      return;
    }
    if (!selectedVehicleId) {
      Alert.alert("Validation Error", "Please select a vehicle.");
      return;
    }

    setIsSaving(true);
    const taskData = {
      title: title.trim(),
      description: description.trim(),
      customerId: selectedCustomerId,
      vehicleId: selectedVehicleId,
      category: selectedCategory,
      status: selectedStatus,
      dueDate: dueDate.trim() || null,
    };

    try {
      if (taskId) {
        await updateTask(taskId, taskData);
        Alert.alert("Success", "Task updated successfully!");
      } else {
        await addTask(taskData);
        Alert.alert("Success", "Task added successfully!");
      }
      navigation.goBack();
    } catch (error) {
      console.error("Failed to save task", error);
      Alert.alert(
        "Error",
        `Failed to ${taskId ? "update" : "save"} task. Please try again.`
      );
    }
    setIsSaving(false);
  };

  if (isLoading && !customers.length) {
    return (
      <ScreenWrapper>
        <View style={styles.centeredMessageContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading Task Details...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.card}>
          <AppTextInput
            label="Task Title"
            placeholder="e.g., Oil Change, Brake Inspection"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            disabled={isSaving}
          />
          <AppTextInput
            label="Description"
            placeholder="Details about the task (optional)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={[
              styles.input,
              styles.textArea,
              { marginBottom: SIZES.large },
            ]} // Added SIZES.large for more spacing
            disabled={isSaving}
          />

          <Text style={styles.label}>Customer</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedCustomerId}
              onValueChange={(itemValue) => {
                setSelectedCustomerId(itemValue);
                // setSelectedVehicleId(null); // Vehicle loading logic is in useEffect
              }}
              style={styles.picker}
              itemStyle={styles.pickerItem}
              prompt="Select Customer"
              enabled={!isSaving && !isLoading}
            >
              <Picker.Item label="Select Customer..." value={null} />
              {customers.map((customer) => (
                <Picker.Item
                  key={customer.id}
                  label={customer.name}
                  value={customer.id}
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Vehicle</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedVehicleId}
              onValueChange={(itemValue) => setSelectedVehicleId(itemValue)}
              style={styles.picker}
              itemStyle={styles.pickerItem}
              enabled={
                !!selectedCustomerId &&
                vehicles.length > 0 &&
                !customerVehiclesLoading &&
                !isSaving
              }
              prompt="Select Vehicle"
            >
              <Picker.Item
                label={
                  !selectedCustomerId
                    ? "Select a customer first"
                    : customerVehiclesLoading
                    ? "Loading vehicles..."
                    : vehicles.length > 0
                    ? "Select Vehicle..."
                    : "No vehicles for this customer"
                }
                value={null}
              />
              {vehicles.map((vehicle) => (
                <Picker.Item
                  key={vehicle.id}
                  label={`${vehicle.make} ${vehicle.model} (${
                    vehicle.year || "N/A"
                  })`}
                  value={vehicle.id}
                />
              ))}
            </Picker>
            {customerVehiclesLoading && (
              <ActivityIndicator
                style={styles.pickerLoadingIndicator}
                color={COLORS.primary}
              />
            )}
          </View>
          {selectedCustomerId &&
            vehicles.length === 0 &&
            !customerVehiclesLoading &&
            !isSaving && ( // Added !isSaving
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("AddEditVehicle", {
                    customerId: selectedCustomerId,
                    customerName: customers.find(
                      (c) => c.id === selectedCustomerId
                    )?.name,
                  })
                }
              >
                <Text style={styles.linkText}>
                  Add Vehicle for{" "}
                  {customers.find((c) => c.id === selectedCustomerId)?.name}
                </Text>
              </TouchableOpacity>
            )}

          <Text style={styles.label}>Category</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={(itemValue) => setSelectedCategory(itemValue)}
              style={styles.picker}
              itemStyle={styles.pickerItem}
              prompt="Select Category"
              enabled={!isSaving}
            >
              {taskCategories.map((category) => (
                <Picker.Item key={category} label={category} value={category} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Status</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedStatus}
              onValueChange={(itemValue) => setSelectedStatus(itemValue)}
              style={styles.picker}
              itemStyle={styles.pickerItem}
              prompt="Select Status"
              enabled={!isSaving}
            >
              {taskStatuses.map((status) => (
                <Picker.Item key={status} label={status} value={status} />
              ))}
            </Picker>
          </View>

          <AppTextInput
            label="Due Date (Optional)"
            placeholder="MM-DD-YYYY"
            value={dueDate}
            onChangeText={setDueDate}
            style={styles.input}
            keyboardType="numeric"
            disabled={isSaving}
          />

          <AppButton
            title={
              isSaving
                ? taskId
                  ? "Updating Task..."
                  : "Saving Task..."
                : taskId
                ? "Update Task"
                : "Save Task"
            }
            onPress={handleSaveTask}
            style={styles.saveButton}
            disabled={isSaving || isLoading || customerVehiclesLoading}
            loading={isSaving} // Added loading prop
            icon={
              isSaving ? undefined : (
                <Ionicons
                  name={
                    taskId ? "checkmark-circle-outline" : "add-circle-outline"
                  }
                  size={22}
                  color={COLORS.white}
                  style={{ marginRight: 8 }}
                />
              )
            }
          />

          {taskId && ( // Delete button inside the card
            <AppButton
              title="Delete Task"
              onPress={() => {
                Alert.alert(
                  "Confirm Delete",
                  "Are you sure you want to delete this task? This action cannot be undone.",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: async () => {
                        setIsSaving(true); // Use isSaving to disable buttons
                        try {
                          await deleteTask(taskId);
                          Alert.alert("Success", "Task deleted successfully.");
                          navigation.goBack();
                        } catch (error) {
                          console.error(
                            "Error deleting task from edit screen:",
                            error
                          );
                          Alert.alert("Error", "Failed to delete task.");
                        } finally {
                          setIsSaving(false);
                        }
                      },
                    },
                  ]
                );
              }}
              style={styles.deleteButton}
              textStyle={styles.deleteButtonText}
              disabled={isSaving} // Disable if saving/updating
              variant="outline" // Using a variant for different styling
              icon={
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={COLORS.error} // Icon color for delete
                  style={{ marginRight: 8 }}
                />
              }
            />
          )}
        </Card>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: SIZES.large, // Ensure space for last button if card is tall
  },
  card: {
    margin: SIZES.medium,
    padding: SIZES.medium,
  },
  input: {
    marginBottom: SIZES.medium,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  label: {
    fontSize: SIZES.small,
    fontFamily: FONTS.orbitronMedium,
    color: COLORS.textSecondary,
    marginBottom: SIZES.extraSmall,
    marginLeft: SIZES.tiny,
  },
  pickerContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.medium,
    marginBottom: SIZES.medium,
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
  saveButton: {
    marginTop: SIZES.large, // Keep or adjust from SIZES.large
    backgroundColor: COLORS.primary,
  },
  deleteButton: {
    marginTop: SIZES.medium,
    backgroundColor: COLORS.surface, // Or transparent, depending on AppButton variant
    borderColor: COLORS.error, // For outline variant
    // borderWidth: 1, // For outline variant if not handled by AppButton
  },
  deleteButtonText: {
    color: COLORS.error,
    fontFamily: FONTS.orbitronSemiBold,
  },
  centeredMessageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.large,
  },
  loadingText: {
    marginTop: SIZES.small,
    fontSize: SIZES.medium,
    fontFamily: FONTS.orbitronRegular,
    color: COLORS.textSecondary,
  },
  pickerLoadingIndicator: {
    position: "absolute",
    right: SIZES.medium,
    top: 0,
    bottom: 0,
    justifyContent: "center", // Center vertically in picker container
  },
  linkText: {
    color: COLORS.primary,
    fontFamily: FONTS.orbitronMedium,
    textAlign: "center",
    paddingVertical: SIZES.small,
    textDecorationLine: "underline",
    marginBottom: SIZES.medium,
  },
});

export default AddEditTaskScreen;
