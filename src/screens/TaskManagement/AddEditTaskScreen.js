import React, { useState, useEffect, useCallback } from 'react'
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator, Text, TouchableOpacity } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import ScreenWrapper from '../../components/common/ScreenWrapper'
import AppTextInput from '../../components/common/AppTextInput'
import AppButton from '../../components/common/AppButton'
import Card from '../../components/common/Card'
import PhotoCapture from '../../components/common/PhotoCapture'
import { COLORS, FONTS, SIZES } from '../../constants/theme'
import { Picker } from '@react-native-picker/picker'
import {
  getCustomers,
  getVehiclesForCustomer,
  getTaskById,
  addTask,
  updateTask,
  deleteTask,
} from '../../database/database'
import { Ionicons } from '@expo/vector-icons'

const taskCategories = ['Repairs', 'Maintenance', 'Diagnostics']
const taskStatuses = [
  'To Do',
  'In Progress',
  'Awaiting Parts',
  'On Hold',
  'Completed',
  'Cancelled',
  'Requires Follow-up',
]

const AddEditTaskScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const taskId = route.params?.taskId

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState(null)
  const [selectedVehicleId, setSelectedVehicleId] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(taskCategories[0])
  const [selectedStatus, setSelectedStatus] = useState(taskStatuses[0])
  const [dueDate, setDueDate] = useState('')
  const [showPhotos, setShowPhotos] = useState(false)

  const [customers, setCustomers] = useState([])
  const [vehicles, setVehicles] = useState([])

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [customerVehiclesLoading, setCustomerVehiclesLoading] = useState(false)

  useEffect(() => {
    if (showPhotos && taskId) {
      navigation.setOptions({ title: 'Task Photos' })
    } else {
      navigation.setOptions({ title: taskId ? 'Edit Task' : 'Add New Task' })
    }
  }, [navigation, taskId, showPhotos])

  const loadInitialData = useCallback(async () => {
    setIsLoading(true)
    try {
      const fetchedCustomers = await getCustomers()
      setCustomers(fetchedCustomers || [])

      if (taskId) {
        const task = await getTaskById(taskId)
        if (task) {
          setTitle(task.title)
          setDescription(task.description || '')
          setSelectedCustomerId(task.customerId)
          setSelectedCategory(task.category || taskCategories[0])
          setSelectedStatus(task.status || taskStatuses[0])
          setDueDate(task.dueDate || '')
        } else {
          Alert.alert('Error', 'Task not found. It may have been deleted.')
          navigation.goBack()
        }
      }
    } catch (error) {
      console.error('Error loading initial data for task screen:', error)
      Alert.alert('Error', 'Failed to load necessary data. Please try again.')
      navigation.goBack()
    }
    setIsLoading(false)
  }, [taskId, navigation])

  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  useEffect(() => {
    const loadVehicles = async () => {
      if (selectedCustomerId) {
        setCustomerVehiclesLoading(true)
        setVehicles([])

        try {
          const fetchedVehicles = await getVehiclesForCustomer(selectedCustomerId)
          setVehicles(fetchedVehicles || [])

          // Attempt to re-select vehicle if editing and customer matches original task customer
          if (taskId) {
            const task = await getTaskById(taskId) // Re-fetch to ensure fresh data
            if (task && task.customerId === selectedCustomerId) {
              setSelectedVehicleId(task.vehicleId)
            } else {
              setSelectedVehicleId(null) // Customer changed or task has no vehicle for this customer
            }
          } else {
            setSelectedVehicleId(null)
          }
        } catch (error) {
          console.error('Error loading vehicles for customer:', error)
          Alert.alert('Error', 'Failed to load vehicles for the selected customer.')
        }
        setCustomerVehiclesLoading(false)
      } else {
        setVehicles([]) // Clear vehicles if no customer is selected
        setSelectedVehicleId(null)
      }
    }

    loadVehicles()
  }, [selectedCustomerId, taskId])

  const handleSaveTask = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Task Title is required.')
      return
    }
    if (!selectedCustomerId) {
      Alert.alert('Validation Error', 'Please select a customer.')
      return
    }
    if (!selectedVehicleId) {
      Alert.alert('Validation Error', 'Please select a vehicle.')
      return
    }

    setIsSaving(true)
    const taskData = {
      title: title.trim(),
      description: description.trim(),
      customerId: selectedCustomerId,
      vehicleId: selectedVehicleId,
      category: selectedCategory,
      status: selectedStatus,
      dueDate: dueDate.trim() || null,
    }

    try {
      if (taskId) {
        await updateTask(taskId, taskData)
        Alert.alert('Success', 'Task updated successfully!')
      } else {
        await addTask(taskData)
        Alert.alert('Success', 'Task added successfully!')
      }
      navigation.goBack()
    } catch (error) {
      console.error('Failed to save task', error)
      Alert.alert('Error', `Failed to ${taskId ? 'update' : 'save'} task. Please try again.`)
    }
    setIsSaving(false)
  }

  const renderTaskForm = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollViewContent}
      keyboardShouldPersistTaps='handled'
    >
      <Card style={styles.card}>
        <AppTextInput
          label='Task Title'
          placeholder='e.g., Oil Change, Brake Inspection'
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          disabled={isSaving}
        />
        <AppTextInput
          label='Description'
          placeholder='Details about the task (optional)'
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={[styles.input, styles.textArea, { marginBottom: SIZES.large }]}
          disabled={isSaving}
        />
        <Text style={styles.label}>Customer</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedCustomerId}
            onValueChange={(itemValue) => {
              setSelectedCustomerId(itemValue)
            }}
            style={styles.picker}
            itemStyle={styles.pickerItem}
            prompt='Select Customer'
            enabled={!isSaving && !isLoading}
          >
            <Picker.Item label='Select Customer...' value={null} />
            {customers.map((customer) => (
              <Picker.Item key={customer.id} label={customer.name} value={customer.id} />
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
            enabled={!!selectedCustomerId && vehicles.length > 0 && !customerVehiclesLoading && !isSaving}
            prompt='Select Vehicle'
          >
            <Picker.Item
              label={
                !selectedCustomerId
                  ? 'Select a customer first'
                  : customerVehiclesLoading
                  ? 'Loading vehicles...'
                  : vehicles.length > 0
                  ? 'Select Vehicle...'
                  : 'No vehicles for this customer'
              }
              value={null}
            />
            {vehicles.map((vehicle) => (
              <Picker.Item
                key={vehicle.id}
                label={`${vehicle.make} ${vehicle.model} (${vehicle.year || 'N/A'})`}
                value={vehicle.id}
              />
            ))}
          </Picker>
          {customerVehiclesLoading && (
            <ActivityIndicator style={styles.pickerLoadingIndicator} color={COLORS.primary} />
          )}
        </View>
        {selectedCustomerId && vehicles.length === 0 && !customerVehiclesLoading && !isSaving && (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('AddEditVehicle', {
                customerId: selectedCustomerId,
                customerName: customers.find((c) => c.id === selectedCustomerId)?.name,
              })
            }
          >
            <Text style={styles.linkText}>
              Add Vehicle for
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
            prompt='Select Category'
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
            prompt='Select Status'
            enabled={!isSaving}
          >
            {taskStatuses.map((status) => (
              <Picker.Item key={status} label={status} value={status} />
            ))}
          </Picker>
        </View>
        <AppTextInput
          label='Due Date (Optional)'
          placeholder='MM-DD-YYYY'
          value={dueDate}
          onChangeText={setDueDate}
          style={styles.input}
          keyboardType='numeric'
          disabled={isSaving}
        />

        {/* Photos button - only show for existing tasks */}
        {taskId && (
          <AppButton
            title='Manage Task Photos'
            onPress={() => setShowPhotos(true)}
            style={styles.photoButton}
            icon={<Ionicons name='camera' size={20} color={COLORS.white} style={{ marginRight: 8 }} />}
          />
        )}

        <AppButton
          title={isSaving ? (taskId ? 'Updating Task...' : 'Saving Task...') : taskId ? 'Update Task' : 'Save Task'}
          onPress={handleSaveTask}
          style={styles.saveButton}
          disabled={isSaving || isLoading || customerVehiclesLoading}
          loading={isSaving}
          icon={
            isSaving ? undefined : (
              <Ionicons
                name={taskId ? 'checkmark-circle-outline' : 'add-circle-outline'}
                size={22}
                color={COLORS.white}
                style={{ marginRight: 8 }}
              />
            )
          }
        />

        {taskId && (
          <AppButton
            title='Delete Task'
            onPress={() => {
              Alert.alert(
                'Confirm Delete',
                'Are you sure you want to delete this task? This action cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                      setIsSaving(true)
                      try {
                        await deleteTask(taskId)
                        Alert.alert('Success', 'Task deleted successfully.')
                        navigation.goBack()
                      } catch (error) {
                        console.error('Error deleting task from edit screen:', error)
                        Alert.alert('Error', 'Failed to delete task.')
                      } finally {
                        setIsSaving(false)
                      }
                    },
                  },
                ]
              )
            }}
            style={styles.deleteButton}
            textStyle={styles.deleteButtonText}
            disabled={isSaving}
            variant='outline'
            icon={<Ionicons name='trash-outline' size={20} color={COLORS.error} style={{ marginRight: 8 }} />}
          />
        )}
      </Card>
    </ScrollView>
  )

  const renderPhotoView = () => (
    <View style={styles.container}>
      <Card style={styles.photoCard}>
        <View style={styles.photoHeader}>
          <Text style={styles.photoTitle}>Task Photos</Text>
          <AppButton
            title='Back to Task Details'
            onPress={() => setShowPhotos(false)}
            variant='secondary'
            size='small'
            style={styles.backButton}
          />
        </View>
        <PhotoCapture
          parentId={taskId}
          parentType='task'
          onPhotosUpdate={(count) => {
            console.log(`Task ${taskId} has ${count} photos`)
          }}
        />
      </Card>
    </View>
  )

  if (isLoading && !customers.length) {
    return (
      <ScreenWrapper>
        <View style={styles.centeredMessageContainer}>
          <ActivityIndicator size='large' color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading Task Details...</Text>
        </View>
      </ScreenWrapper>
    )
  }

  return (
    <ScreenWrapper>
      {/* Conditionally render task form or photo capture based on showPhotos state */}
      {taskId && showPhotos ? renderPhotoView() : renderTaskForm()}
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  card: {
    margin: 0,
    padding: 16,
    borderRadius: 0,
    flex: 1,
  },
  photoCard: {
    margin: 0,
    padding: 16,
    borderRadius: 0,
    flex: 1,
  },
  input: {
    marginBottom: SIZES.medium,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: SIZES.small,
    fontFamily: FONTS.medium,
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
    justifyContent: 'center',
  },
  picker: {
    height: 50,
    color: COLORS.text,
    backgroundColor: 'transparent',
  },
  pickerItem: {
    fontFamily: FONTS.regular,
  },
  photoButton: {
    marginTop: SIZES.large,
    marginBottom: SIZES.medium,
    backgroundColor: COLORS.accent,
  },
  saveButton: {
    marginTop: SIZES.large,
    backgroundColor: COLORS.primary,
  },
  deleteButton: {
    marginTop: SIZES.medium,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.error,
  },
  deleteButtonText: {
    color: COLORS.error,
    fontFamily: FONTS.semiBold,
  },
  centeredMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.large,
  },
  loadingText: {
    marginTop: SIZES.small,
    fontSize: SIZES.medium,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  pickerLoadingIndicator: {
    position: 'absolute',
    right: SIZES.medium,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  linkText: {
    color: COLORS.primary,
    fontFamily: FONTS.medium,
    textAlign: 'center',
    paddingVertical: SIZES.small,
    textDecorationLine: 'underline',
    marginBottom: SIZES.medium,
  },
  photoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  photoTitle: {
    ...FONTS.h3,
    color: COLORS.white,
  },
  backButton: {
    marginLeft: SIZES.medium,
  },
})

export default AddEditTaskScreen
