import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { cameraService } from "../../services/cameraService";
import { TouchableOpacity } from "./TouchableOpacity";

const { width } = Dimensions.get("window");

interface ImageUploadProps {
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  allowMultiple?: boolean;
  initialImages?: string[];
  imageStyle?: object;
  containerStyle?: object;
}

interface ImageItem {
  uri: string;
  id: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImagesChange,
  maxImages = 5,
  allowMultiple = true,
  initialImages = [],
  imageStyle,
  containerStyle,
}) => {
  const [images, setImages] = useState<ImageItem[]>(
    initialImages.map((uri, index) => ({ uri, id: `initial_${index}` }))
  );
  const [loading, setLoading] = useState(false);

  const updateImages = (newImages: ImageItem[]) => {
    setImages(newImages);
    onImagesChange(newImages.map((img) => img.uri));
  };

  const handleAddImage = async () => {
    if (images.length >= maxImages) {
      Alert.alert("Maximum Images", `You can only upload ${maxImages} images.`);
      return;
    }

    setLoading(true);

    try {
      const result = await cameraService.showImagePicker({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result && !result.canceled && result.assets[0]) {
        const newImage: ImageItem = {
          uri: result.assets[0].uri,
          id: `image_${Date.now()}`,
        };

        updateImages([...images, newImage]);
      }
    } catch {
      Alert.alert("Error", "Failed to add image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMultipleImages = async () => {
    if (images.length >= maxImages) {
      Alert.alert("Maximum Images", `You can only upload ${maxImages} images.`);
      return;
    }

    setLoading(true);

    try {
      const result = await cameraService.pickMultipleImages({
        quality: 0.8,
      });

      if (result && !result.canceled && result.assets) {
        const newImages: ImageItem[] = result.assets
          .slice(0, maxImages - images.length)
          .map((asset: any, index: number) => ({
            uri: asset.uri,
            id: `multi_${Date.now()}_${index}`,
          }));

        updateImages([...images, ...newImages]);
      }
    } catch {
      Alert.alert("Error", "Failed to add images. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = (id: string) => {
    Alert.alert("Remove Image", "Are you sure you want to remove this image?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          const filteredImages = images.filter((img) => img.id !== id);
          updateImages(filteredImages);
        },
      },
    ]);
  };

  const renderAddButton = () => (
    <TouchableOpacity
      style={[styles.addButton, imageStyle]}
      onPress={allowMultiple ? undefined : handleAddImage}
      onLongPress={allowMultiple ? handleAddMultipleImages : undefined}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#C9A961" />
      ) : (
        <>
          <Ionicons name="camera" size={24} color="#C9A961" />
          <Text style={styles.addButtonText}>Add Photo</Text>
          {allowMultiple && (
            <Text style={styles.addButtonSubtext}>Hold for multiple</Text>
          )}
        </>
      )}
    </TouchableOpacity>
  );

  const renderImageItem = ({ item }: { item: ImageItem }) => (
    <View style={[styles.imageContainer, imageStyle]}>
      <Image source={{ uri: item.uri }} style={styles.image} />
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveImage(item.id)}
      >
        <Ionicons name="close-circle" size={20} color="#FF6B6B" />
      </TouchableOpacity>
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleAddImage}
        disabled={images.length >= maxImages}
      >
        <Ionicons name="camera" size={20} color="#FFF" />
        <Text style={styles.actionButtonText}>Camera</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => cameraService.pickImage()}
        disabled={images.length >= maxImages}
      >
        <Ionicons name="images" size={20} color="#FFF" />
        <Text style={styles.actionButtonText}>Gallery</Text>
      </TouchableOpacity>

      {allowMultiple && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleAddMultipleImages}
          disabled={images.length >= maxImages}
        >
          <Ionicons name="duplicate" size={20} color="#FFF" />
          <Text style={styles.actionButtonText}>Multiple</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>
        Product Images ({images.length}/{maxImages})
      </Text>

      {images.length > 0 && (
        <FlatList
          data={images}
          renderItem={renderImageItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imageList}
        />
      )}

      {images.length < maxImages && renderActionButtons()}

      <Text style={styles.helpText}>
        Tip: Take clear, well-lit photos from multiple angles.{" "}
        {allowMultiple
          ? "Hold the multiple button to select several photos at once."
          : ""}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  imageList: {
    marginBottom: 16,
  },
  imageContainer: {
    marginRight: 12,
    position: "relative",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
  },
  removeButton: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FFF",
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  addButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#C9A961",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
  },
  addButtonText: {
    fontSize: 10,
    color: "#C9A961",
    marginTop: 4,
    textAlign: "center",
  },
  addButtonSubtext: {
    fontSize: 8,
    color: "#999",
    textAlign: "center",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#C9A961",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    opacity: 1,
  },
  actionButtonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  helpText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default ImageUpload;
