import { Camera } from "expo-camera";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import Toast from "react-native-toast-message";

export interface PhotoOptions {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  base64?: boolean;
  exif?: boolean;
}

export interface CameraPermissions {
  camera: boolean;
  mediaLibrary: boolean;
}

class CameraService {
  /**
   * Request camera and media library permissions
   */
  async requestPermissions(): Promise<CameraPermissions> {
    try {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const mediaPermission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      return {
        camera: cameraPermission.status === "granted",
        mediaLibrary: mediaPermission.status === "granted",
      };
    } catch (error) {
      console.error("Error requesting permissions:", error);
      return { camera: false, mediaLibrary: false };
    }
  }

  /**
   * Check if permissions are already granted
   */
  async checkPermissions(): Promise<CameraPermissions> {
    try {
      const cameraPermission = await Camera.getCameraPermissionsAsync();
      const mediaPermission =
        await ImagePicker.getMediaLibraryPermissionsAsync();

      return {
        camera: cameraPermission.status === "granted",
        mediaLibrary: mediaPermission.status === "granted",
      };
    } catch (error) {
      console.error("Error checking permissions:", error);
      return { camera: false, mediaLibrary: false };
    }
  }

  /**
   * Take a photo using the camera
   */
  async takePhoto(
    options: PhotoOptions = {}
  ): Promise<ImagePicker.ImagePickerResult | null> {
    try {
      const permissions = await this.checkPermissions();

      if (!permissions.camera) {
        const granted = await this.requestPermissions();
        if (!granted.camera) {
          Alert.alert(
            "Camera Permission Required",
            "Please enable camera access in Settings to take photos.",
            [{ text: "OK" }]
          );
          return null;
        }
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options.allowsEditing ?? true,
        aspect: options.aspect ?? [4, 3],
        quality: options.quality ?? 0.8,
        base64: options.base64 ?? false,
        exif: options.exif ?? false,
      });

      return result;
    } catch (error) {
      console.error("Error taking photo:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to take photo. Please try again.",
      });
      return null;
    }
  }

  /**
   * Pick an image from the gallery
   */
  async pickImage(
    options: PhotoOptions = {}
  ): Promise<ImagePicker.ImagePickerResult | null> {
    try {
      const permissions = await this.checkPermissions();

      if (!permissions.mediaLibrary) {
        const granted = await this.requestPermissions();
        if (!granted.mediaLibrary) {
          Alert.alert(
            "Media Library Permission Required",
            "Please enable photo library access in Settings to select images.",
            [{ text: "OK" }]
          );
          return null;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options.allowsEditing ?? true,
        aspect: options.aspect ?? [4, 3],
        quality: options.quality ?? 0.8,
        base64: options.base64 ?? false,
        exif: options.exif ?? false,
      });

      return result;
    } catch (error) {
      console.error("Error picking image:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to select image. Please try again.",
      });
      return null;
    }
  }

  /**
   * Pick multiple images from the gallery
   */
  async pickMultipleImages(
    options: PhotoOptions = {}
  ): Promise<ImagePicker.ImagePickerResult | null> {
    try {
      const permissions = await this.checkPermissions();

      if (!permissions.mediaLibrary) {
        const granted = await this.requestPermissions();
        if (!granted.mediaLibrary) {
          Alert.alert(
            "Media Library Permission Required",
            "Please enable photo library access in Settings to select images.",
            [{ text: "OK" }]
          );
          return null;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: options.quality ?? 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 10, // Maximum 10 images
      });

      return result;
    } catch (error) {
      console.error("Error picking multiple images:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to select images. Please try again.",
      });
      return null;
    }
  }

  /**
   * Save image to device gallery
   */
  async saveToGallery(uri: string): Promise<boolean> {
    try {
      const permissions = await MediaLibrary.requestPermissionsAsync();

      if (permissions.status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please enable media library access to save images.",
          [{ text: "OK" }]
        );
        return false;
      }

      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync("Tishyaa Jewels", asset, false);

      return true;
    } catch (error) {
      console.error("Error saving to gallery:", error);
      return false;
    }
  }

  /**
   * Resize image to specified dimensions
   */
  async resizeImage(
    uri: string,
    width: number,
    height: number
  ): Promise<string | null> {
    try {
      const manipResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [width, height],
        quality: 0.8,
      });

      if (!manipResult.canceled && manipResult.assets[0]) {
        return manipResult.assets[0].uri;
      }

      return null;
    } catch (error) {
      console.error("Error resizing image:", error);
      return null;
    }
  }

  /**
   * Get image info including dimensions and file size
   */
  async getImageInfo(uri: string): Promise<FileSystem.FileInfo | null> {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      return info;
    } catch (error) {
      console.error("Error getting image info:", error);
      return null;
    }
  }

  /**
   * Show action sheet to choose between camera and gallery
   */
  async showImagePicker(
    options: PhotoOptions = {}
  ): Promise<ImagePicker.ImagePickerResult | null> {
    return new Promise((resolve) => {
      Alert.alert(
        "Select Photo",
        "Choose how you want to add a photo",
        [
          {
            text: "Camera",
            onPress: async () => {
              const result = await this.takePhoto(options);
              resolve(result);
            },
          },
          {
            text: "Gallery",
            onPress: async () => {
              const result = await this.pickImage(options);
              resolve(result);
            },
          },
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => resolve(null),
          },
        ],
        { cancelable: true, onDismiss: () => resolve(null) }
      );
    });
  }

  /**
   * Convert image to base64
   */
  async imageToBase64(uri: string): Promise<string | null> {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64",
      });
      return base64;
    } catch (error) {
      console.error("Error converting to base64:", error);
      return null;
    }
  }

  /**
   * Generate thumbnail from image
   */
  async generateThumbnail(
    uri: string,
    width = 200,
    height = 200
  ): Promise<string | null> {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [width, height],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }

      return null;
    } catch (error) {
      console.error("Error generating thumbnail:", error);
      return null;
    }
  }
}

export const cameraService = new CameraService();
export default cameraService;
