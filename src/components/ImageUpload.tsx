import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { launchImageLibraryAsync, MediaTypeOptions } from "expo-image-picker";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ImageUploadProps {
  onImageSelected: (uri: string) => void;
  currentImage?: string;
  placeholder?: string;
  aspectRatio?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelected,
  currentImage,
  placeholder = "Select Image",
  aspectRatio = 1,
}) => {
  const [uploading, setUploading] = useState(false);

  const selectImage = async () => {
    try {
      const result = await launchImageLibraryAsync({
        mediaTypes: MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [aspectRatio, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploading(true);
        // In a real app, you would upload to your server here
        // For now, we'll just use the local URI
        onImageSelected(result.assets[0].uri);
        setUploading(false);
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to select image",
      });
      setUploading(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={selectImage}
      disabled={uploading}
    >
      {currentImage ? (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: currentImage }}
            style={styles.image}
            contentFit="cover"
          />
          <View style={styles.overlay}>
            <Ionicons name="camera" size={20} color="#fff" />
            <Text style={styles.overlayText}>Change</Text>
          </View>
        </View>
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="cloud-upload" size={32} color="#9ca3af" />
          <Text style={styles.placeholderText}>{placeholder}</Text>
          {uploading && <Text style={styles.uploadingText}>Uploading...</Text>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
  },
  overlayText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  placeholderText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 8,
    textAlign: "center",
  },
  uploadingText: {
    fontSize: 12,
    color: "#dc2626",
    marginTop: 4,
  },
});

export { ImageUpload };
