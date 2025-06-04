import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as MediaLibrary from 'expo-media-library'
import { v4 as uuidv4 } from 'uuid'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, FONTS, SIZES } from '../../constants/theme'
import { AppButton } from './index'
import { addPhoto, getPhotosByParent, deletePhoto, updatePhoto } from '../../database/database'

const { width } = Dimensions.get('window')
const PHOTO_SIZE = (width - SIZES.padding * 3) / 2

const PhotoCapture = ({ parentId, parentType, onPhotosUpdate }) => {
  const [photos, setPhotos] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)

  React.useEffect(() => {
    loadPhotos()
  }, [parentId, parentType])

  const loadPhotos = async () => {
    if (!parentId || !parentType) return

    try {
      setIsLoading(true)
      const photoData = await getPhotosByParent(parentId, parentType)
      setPhotos(photoData || [])
      if (onPhotosUpdate) {
        onPhotosUpdate(photoData?.length || 0)
      }
    } catch (error) {
      console.error('Error loading photos:', error)
      Alert.alert('Error', 'Failed to load photos')
    } finally {
      setIsLoading(false)
    }
  }

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync()
    const { status: mediaLibraryStatus } = await MediaLibrary.requestPermissionsAsync()

    if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and media library permissions are required to capture and save photos.'
      )
      return false
    }
    return true
  }

  const capturePhoto = async () => {
    const hasPermissions = await requestPermissions()
    if (!hasPermissions) return

    Alert.alert('Capture Photo', 'Choose an option', [
      { text: 'Camera', onPress: () => openCamera() },
      { text: 'Photo Library', onPress: () => openLibrary() },
      { text: 'Cancel', style: 'cancel' },
    ])
  }

  const openCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        await savePhoto(result.assets[0].uri)
      }
    } catch (error) {
      console.error('Error opening camera:', error)
      Alert.alert('Error', 'Failed to open camera')
    }
  }

  const openLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        await savePhoto(result.assets[0].uri)
      }
    } catch (error) {
      console.error('Error opening library:', error)
      Alert.alert('Error', 'Failed to open photo library')
    }
  }

  const savePhoto = async (uri) => {
    try {
      setIsLoading(true)

      // Save to device gallery
      await MediaLibrary.saveToLibraryAsync(uri)

      // Save to database
      const photoData = {
        id: uuidv4(),
        parentId,
        parentType,
        uri,
        notes: '',
      }

      await addPhoto(photoData)
      await loadPhotos()

      Alert.alert('Success', 'Photo saved successfully!')
    } catch (error) {
      console.error('Error saving photo:', error)
      Alert.alert('Error', 'Failed to save photo')
    } finally {
      setIsLoading(false)
    }
  }

  const deletePhotoHandler = async (photoId) => {
    Alert.alert('Delete Photo', 'Are you sure you want to delete this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePhoto(photoId)
            await loadPhotos()
          } catch (error) {
            console.error('Error deleting photo:', error)
            Alert.alert('Error', 'Failed to delete photo')
          }
        },
      },
    ])
  }

  const viewPhoto = (photo) => {
    setSelectedPhoto(photo)
    setModalVisible(true)
  }

  const renderPhoto = ({ item }) => (
    <TouchableOpacity style={styles.photoContainer} onPress={() => viewPhoto(item)}>
      <Image source={{ uri: item.uri }} style={styles.photo} />
      <TouchableOpacity style={styles.deleteButton} onPress={() => deletePhotoHandler(item.id)}>
        <Ionicons name='close-circle' size={24} color={COLORS.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Photos ({photos.length})</Text>
        <TouchableOpacity style={styles.captureButton} onPress={capturePhoto} disabled={isLoading}>
          <Ionicons name='camera' size={24} color={COLORS.white} />
          <Text style={styles.captureButtonText}>Add Photo</Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={COLORS.primary} />
        </View>
      )}

      {photos.length === 0 && !isLoading ? (
        <View style={styles.emptyContainer}>
          <Ionicons name='image-outline' size={64} color={COLORS.gray} />
          <Text style={styles.emptyText}>No photos yet</Text>
          <Text style={styles.emptySubtext}>Tap "Add Photo" to capture or select photos</Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          renderItem={renderPhoto}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.photosList}
        />
      )}

      {/* Photo View Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType='fade'
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalBackground} onPress={() => setModalVisible(false)}>
            <View style={styles.modalContent}>
              {selectedPhoto && (
                <Image source={{ uri: selectedPhoto.uri }} style={styles.fullPhoto} resizeMode='contain' />
              )}
              <TouchableOpacity style={styles.closeModal} onPress={() => setModalVisible(false)}>
                <Ionicons name='close' size={32} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  title: {
    ...FONTS.h3,
    color: COLORS.white,
  },
  captureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.radius,
  },
  captureButtonText: {
    ...FONTS.body3,
    color: COLORS.white,
    marginLeft: SIZES.base,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.padding * 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.padding * 2,
  },
  emptyText: {
    ...FONTS.h4,
    color: COLORS.white,
    marginTop: SIZES.padding,
  },
  emptySubtext: {
    ...FONTS.body4,
    color: COLORS.white,
    textAlign: 'center',
    marginTop: SIZES.base,
  },
  photosList: {
    paddingBottom: SIZES.padding,
  },
  photoContainer: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    marginRight: SIZES.padding,
    marginBottom: SIZES.padding,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '70%',
    position: 'relative',
  },
  fullPhoto: {
    width: '100%',
    height: '100%',
  },
  closeModal: {
    position: 'absolute',
    top: -50,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
})

export default PhotoCapture
