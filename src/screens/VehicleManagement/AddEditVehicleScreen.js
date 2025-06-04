import 'react-native-get-random-values' // Import for uuid
import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator, Text } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { v4 as uuidv4 } from 'uuid'
import { ScreenWrapper, AppTextInput, AppButton, Card, PhotoCapture } from '../../components/common' // Reverted to barrel import
import { COLORS, FONTS, SIZES } from '../../constants/theme'
import { addVehicle, getVehicleById, updateVehicle } from '../../database/database'

const AddEditVehicleScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { customerId, customerName, vehicleId } = route.params

  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [vin, setVin] = useState('')
  const [engineType, setEngineType] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  // Track whether to show vehicle details or photos
  const [showPhotos, setShowPhotos] = useState(false)

  const isEditing = vehicleId !== undefined

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? `Edit Vehicle for ${customerName}` : `Add Vehicle for ${customerName}`,
    })
    if (isEditing) {
      loadVehicleData()
    }
  }, [isEditing, customerName, vehicleId, navigation])

  const loadVehicleData = async () => {
    setIsLoading(true)
    try {
      const vehicle = await getVehicleById(vehicleId)
      if (vehicle) {
        setMake(vehicle.make || '')
        setModel(vehicle.model || '')
        setYear(vehicle.year?.toString() || '') // Ensure year is a string for TextInput
        setVin(vehicle.vin || '')
        setEngineType(vehicle.engineType || '')
      } else {
        Alert.alert('Error', 'Vehicle not found.')
        navigation.goBack()
      }
    } catch (error) {
      console.error('Error loading vehicle:', error)
      Alert.alert('Error', 'Failed to load vehicle data.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveVehicle = async () => {
    if (!make.trim() || !model.trim() || !year.trim()) {
      Alert.alert('Validation Error', 'Make, Model, and Year are required.')
      return
    }
    if (year.trim() && (isNaN(parseInt(year.trim(), 10)) || year.trim().length !== 4)) {
      Alert.alert('Validation Error', 'Please enter a valid 4-digit year.')
      return
    }

    setIsLoading(true)
    const vehicleData = {
      id: isEditing ? vehicleId : uuidv4(),
      customerId,
      make: make.trim(),
      model: model.trim(),
      year: parseInt(year.trim(), 10),
      vin: vin.trim() === '' ? null : vin.trim(),
      engineType: engineType.trim(),
    }

    try {
      if (isEditing) {
        await updateVehicle(vehicleId, vehicleData)
        Alert.alert('Success', 'Vehicle updated successfully.')
      } else {
        await addVehicle(vehicleData)
        Alert.alert('Success', 'Vehicle added successfully.')
      }
      navigation.goBack()
    } catch (error) {
      console.error('Error saving vehicle:', error)
      Alert.alert('Error', `Failed to save vehicle: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Render the vehicle form view
  const renderVehicleForm = () => (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps='handled'
    >
      <Card style={styles.card}>
        <AppTextInput
          label='Make'
          value={make}
          onChangeText={setMake}
          placeholder='e.g., Toyota, Ford'
          disabled={isLoading}
        />
        <AppTextInput
          label='Model'
          value={model}
          onChangeText={setModel}
          placeholder='e.g., Camry, F-150'
          disabled={isLoading}
        />
        <AppTextInput
          label='Year'
          value={year}
          onChangeText={setYear}
          placeholder='e.g., 2023'
          keyboardType='numeric'
          maxLength={4}
          disabled={isLoading}
        />
        <AppTextInput
          label='VIN (Vehicle Identification Number)'
          value={vin}
          onChangeText={setVin}
          placeholder='Enter VIN (optional)'
          autoCapitalize='characters'
          maxLength={17}
          disabled={isLoading}
        />
        <AppTextInput
          label='Engine Type'
          value={engineType}
          onChangeText={setEngineType}
          placeholder='e.g., 2.5L 4-Cylinder, V6, Electric (optional)'
          disabled={isLoading}
        />

        {isEditing && (
          <AppButton
            title='Manage Vehicle Photos'
            onPress={() => setShowPhotos(true)}
            style={styles.photoButton}
            icon='camera'
          />
        )}

        <AppButton
          title={isEditing ? 'Update Vehicle' : 'Add Vehicle'}
          onPress={handleSaveVehicle}
          disabled={isLoading}
          loading={isLoading}
          style={styles.saveButton}
        />
      </Card>
    </ScrollView>
  )

  // Render the photo management view
  const renderPhotoView = () => (
    <View style={styles.container}>
      <Card style={styles.card}>
        <View style={styles.photoHeader}>
          <Text style={styles.sectionTitle}>Vehicle Photos</Text>
          <AppButton
            title='Back to Vehicle Details'
            onPress={() => setShowPhotos(false)}
            variant='secondary'
            size='small'
            style={styles.backButton}
          />
        </View>
        <PhotoCapture
          parentId={vehicleId}
          parentType='vehicle'
          onPhotosUpdate={(count) => {
            // Optional: You can handle photo count updates here
            console.log(`Vehicle ${vehicleId} now has ${count} photos`)
          }}
        />
      </Card>
    </View>
  )

  if (isLoading && isEditing) {
    return (
      <ScreenWrapper>
        <View style={styles.centeredMessageContainer}>
          <ActivityIndicator size='large' color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading vehicle data...</Text>
        </View>
      </ScreenWrapper>
    )
  }

  return <ScreenWrapper>{isEditing && showPhotos ? renderPhotoView() : renderVehicleForm()}</ScreenWrapper>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  card: {
    margin: 0,
    padding: SIZES.padding,
    borderRadius: 0,
    flex: 1,
  },
  saveButton: {
    marginTop: SIZES.padding * 1.5,
  },
  photoButton: {
    marginTop: SIZES.padding * 1.5,
    backgroundColor: COLORS.accent,
  },
  photoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  backButton: {
    marginLeft: SIZES.base,
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.white,
  },
  centeredMessageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: SIZES.base,
    fontFamily: FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
  },
})

export default AddEditVehicleScreen
