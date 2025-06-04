import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SIZES } from "../../constants/theme";
import { getPhotosByParent } from "../../database/database";

const { width } = Dimensions.get("window");
const PHOTO_SIZE = (width - SIZES.padding * 4) / 3;

const PhotoGallery = ({ parentId, parentType, onClose }) => {
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);

  useEffect(() => {
    loadPhotos();
  }, [parentId, parentType]);

  const loadPhotos = async () => {
    try {
      setIsLoading(true);
      const photoData = await getPhotosByParent(parentId, parentType);
      setPhotos(photoData || []);
    } catch (error) {
      console.error("Error loading photos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const viewPhoto = (photo) => {
    setSelectedPhoto(photo);
    setPhotoModalVisible(true);
  };

  const renderPhoto = ({ item }) => (
    <TouchableOpacity
      style={styles.photoContainer}
      onPress={() => viewPhoto(item)}
    >
      <Image source={{ uri: item.uri }} style={styles.photo} />
    </TouchableOpacity>
  );

  return (
    <Modal visible={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Photos ({photos.length})</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading photos...</Text>
          </View>
        ) : photos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="image-outline" size={64} color={COLORS.gray} />
            <Text style={styles.emptyText}>No photos available</Text>
          </View>
        ) : (
          <FlatList
            data={photos}
            renderItem={renderPhoto}
            keyExtractor={(item) => item.id}
            numColumns={3}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.photosList}
          />
        )}

        {/* Full Photo View Modal */}
        <Modal
          visible={photoModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setPhotoModalVisible(false)}
        >
          <View style={styles.photoModalContainer}>
            <TouchableOpacity
              style={styles.photoModalBackground}
              onPress={() => setPhotoModalVisible(false)}
            >
              <View style={styles.photoModalContent}>
                {selectedPhoto && (
                  <Image
                    source={{ uri: selectedPhoto.uri }}
                    style={styles.fullPhoto}
                    resizeMode="contain"
                  />
                )}
                <TouchableOpacity
                  style={styles.closePhotoModal}
                  onPress={() => setPhotoModalVisible(false)}
                >
                  <Ionicons name="close" size={32} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    ...FONTS.h3,
    color: COLORS.white,
  },
  closeButton: {
    padding: SIZES.base,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...FONTS.body3,
    color: COLORS.white,
    marginTop: SIZES.padding,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    ...FONTS.h4,
    color: COLORS.gray,
    marginTop: SIZES.padding,
  },
  photosList: {
    padding: SIZES.padding,
  },
  photoContainer: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    margin: SIZES.base / 2,
    borderRadius: SIZES.radius,
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
  photoModalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  photoModalContent: {
    width: "90%",
    height: "70%",
    position: "relative",
  },
  fullPhoto: {
    width: "100%",
    height: "100%",
  },
  closePhotoModal: {
    position: "absolute",
    top: -50,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 8,
  },
});

export default PhotoGallery;
