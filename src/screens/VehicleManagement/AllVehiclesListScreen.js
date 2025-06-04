import React, { useState, useCallback, useEffect } from 'react'
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { ScreenWrapper, AppButton, Card, AppTextInput } from '../../components/common' // Reverted to barrel import
import { COLORS, FONTS, SIZES } from '../../constants/theme'
import {
  getAllVehiclesWithCustomerNames,
  deleteVehicle,
  getCustomers,
  getPhotosByParent,
} from '../../database/database'
import { Picker } from '@react-native-picker/picker' // For customer filter dropdown

const AllVehiclesListScreen = () => {
  const navigation = useNavigation()
  const [allVehicles, setAllVehicles] = useState([])
  const [filteredVehicles, setFilteredVehicles] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [customers, setCustomers] = useState([])
  const [photoCounts, setPhotoCounts] = useState({})

  // Filter states
  const [selectedCustomerId, setSelectedCustomerId] = useState(null)
  const [makeFilter, setMakeFilter] = useState('')
  const [modelFilter, setModelFilter] = useState('')
  const loadInitialData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [fetchedVehicles, fetchedCustomers] = await Promise.all([getAllVehiclesWithCustomerNames(), getCustomers()])
      setAllVehicles(fetchedVehicles)
      setFilteredVehicles(fetchedVehicles) // Initially, filtered is all
      setCustomers([{ id: null, name: 'All Customers' }, ...fetchedCustomers]) // Add "All Customers" option

      // Load photo counts for each vehicle
      await loadPhotoCounts(fetchedVehicles)
    } catch (error) {
      Alert.alert('Error', 'Failed to load vehicles or customers.')
      console.error('Failed to load initial data for AllVehiclesListScreen:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      loadInitialData()
    }, [loadInitialData]) // loadInitialData is a dependency
  )

  // Apply filters whenever filter criteria change
  useEffect(() => {
    let tempVehicles = allVehicles
    if (selectedCustomerId) {
      tempVehicles = tempVehicles.filter((v) => v.customerId === selectedCustomerId)
    }
    if (makeFilter.trim()) {
      tempVehicles = tempVehicles.filter((v) => v.make.toLowerCase().includes(makeFilter.trim().toLowerCase()))
    }
    if (modelFilter.trim()) {
      tempVehicles = tempVehicles.filter((v) => v.model.toLowerCase().includes(modelFilter.trim().toLowerCase()))
    }
    setFilteredVehicles(tempVehicles)
  }, [selectedCustomerId, makeFilter, modelFilter, allVehicles])

  const handleEditVehicle = (vehicle) => {
    navigation.navigate('AddEditVehicle', {
      customerId: vehicle.customerId,
      customerName: vehicle.customerName, // Pass customerName for the AddEditVehicleScreen title
      vehicleId: vehicle.id,
    })
  }

  const handleDeleteVehicle = (id) => {
    Alert.alert('Delete Vehicle', 'Are you sure you want to delete this vehicle? This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setIsLoading(true)
          try {
            await deleteVehicle(id)
            Alert.alert('Success', 'Vehicle deleted successfully.')
            loadInitialData() // Refresh the list by reloading all data
          } catch (error) {
            Alert.alert('Error', `Failed to delete vehicle: ${error.message}`)
            console.error('Failed to delete vehicle:', error)
          } finally {
            setIsLoading(false)
          }
        },
      },
    ])
  }

  const clearFilters = () => {
    setSelectedCustomerId(null)
    setMakeFilter('')
    setModelFilter('')
  }

  const loadPhotoCounts = async (vehicles) => {
    try {
      const counts = {}
      await Promise.all(
        vehicles.map(async (vehicle) => {
          const photos = await getPhotosByParent(vehicle.id, 'vehicle')
          counts[vehicle.id] = photos.length
        })
      )
      setPhotoCounts(counts)
    } catch (error) {
      console.error('Error loading photo counts:', error)
    }
  }

  const renderVehicle = ({ item }) => (
    <Card style={styles.vehicleCard}>
      <TouchableOpacity onPress={() => handleEditVehicle(item)} style={styles.cardContent}>
        <View style={styles.vehicleHeader}>
          <Text style={styles.vehicleName}>
            {item.year} {item.make} {item.model}
          </Text>
          <View style={styles.photoIndicator}>
            <Ionicons name='camera' size={16} color={COLORS.primary} />
            <Text style={styles.photoCount}>{photoCounts[item.id] || 0}</Text>
          </View>
        </View>
        <Text style={styles.customerNameText}>Owner: {item.customerName}</Text>
        <Text style={styles.vehicleDetail}>VIN: {item.vin || 'N/A'}</Text>
        <Text style={styles.vehicleDetail}>Engine: {item.engineType || 'N/A'}</Text>
      </TouchableOpacity>
      <AppButton
        title='Delete'
        onPress={() => handleDeleteVehicle(item.id)}
        style={styles.deleteButton}
        variant='error'
        size='small'
      />
    </Card>
  )

  const renderListHeader = () => (
    <>
      <View style={styles.filterContainer}>
        <View style={styles.pickerWrapper}>
          <Picker
            mode='dropdown'
            selectedValue={selectedCustomerId}
            onValueChange={(itemValue) => setSelectedCustomerId(itemValue)}
            style={styles.picker}
            itemStyle={{ color: COLORS.text, fontSize: SIZES.font }}
            dropdownIconColor={COLORS.text}
          >
            {customers.map((c) => (
              <Picker.Item key={c.id || 'all'} label={c.name} value={c.id} color={COLORS.text} />
            ))}
          </Picker>
        </View>
        <AppTextInput
          placeholder='Filter by Make (e.g., Ford)'
          value={makeFilter}
          onChangeText={setMakeFilter}
          style={styles.filterInput}
        />
        <AppTextInput
          placeholder='Filter by Model (e.g., F-150)'
          value={modelFilter}
          onChangeText={setModelFilter}
          style={styles.filterInput}
        />
        <AppButton
          title='Clear Filters'
          onPress={clearFilters}
          style={styles.clearButton}
          size='small'
          variant='transparent'
        />
      </View>

      {filteredVehicles.length === 0 && !isLoading && (
        <View style={styles.centeredMessageContainer}>
          <Text style={styles.noItemsText}>No vehicles found matching your criteria.</Text>
        </View>
      )}
    </>
  )

  if (isLoading && allVehicles.length === 0) {
    return (
      <ScreenWrapper>
        <View style={styles.centeredMessageContainer}>
          <ActivityIndicator size='large' color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading all vehicles...</Text>
        </View>
      </ScreenWrapper>
    )
  }

  return (
    <ScreenWrapper>
      <FlatList
        data={filteredVehicles}
        renderItem={renderVehicle}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={loadInitialData}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={null} // We handle empty state in the header
      />
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  filterContainer: {
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginHorizontal: -SIZES.medium, // Compensate for ScreenWrapper padding
  },
  pickerWrapper: {
    backgroundColor: COLORS.background, // Match TextInput background
    borderRadius: SIZES.radius,
    marginBottom: SIZES.base,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: SIZES.padding, // Add horizontal margin to account for filterContainer padding
  },
  picker: {
    height: 50,
    width: '100%',
    color: COLORS.text, // Ensure picker text is visible
    backgroundColor: COLORS.surface, // Added background color for the picker itself
  },
  filterInput: {
    marginBottom: SIZES.base,
    marginHorizontal: SIZES.padding, // Add horizontal margin to account for filterContainer padding
  },
  clearButton: {
    marginBottom: SIZES.padding,
    borderColor: COLORS.accent,
    marginHorizontal: SIZES.padding, // Add horizontal margin to account for filterContainer padding
  },
  centeredMessageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding * 2,
    paddingVertical: SIZES.padding * 4,
  },
  loadingText: {
    marginTop: SIZES.base,
    fontFamily: FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
  },
  vehicleCard: {
    marginHorizontal: SIZES.padding,
    marginTop: SIZES.medium, // Ensure spacing when list is not empty
  },
  cardContent: {
    flex: 1,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  vehicleName: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.text,
    flex: 1,
  },
  photoIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.base / 2,
    borderRadius: SIZES.radius / 2,
  },
  photoCount: {
    fontFamily: FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.primary,
    marginLeft: 4,
  },
  customerNameText: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.small, // Smaller font for customer name
    color: COLORS.accent, // Use accent color for customer name
    marginBottom: SIZES.base / 2,
  },
  vehicleDetail: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    marginBottom: SIZES.base / 2,
  },
  deleteButton: {
    marginTop: SIZES.base,
  },
  noItemsText: {
    textAlign: 'center',
    fontFamily: FONTS.regular,
    fontSize: SIZES.body3,
    color: COLORS.text,
    marginTop: SIZES.padding * 2,
  },
  listContentContainer: {
    paddingBottom: SIZES.padding,
  },
})

export default AllVehiclesListScreen
