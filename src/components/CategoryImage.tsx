import { NavigationProp, useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface CategoryImageProps {
  category: {
    id: string;
    name: string;
    image: string;
    description?: string;
  };
  onPress?: (category: any) => void;
}

const CategoryImage: React.FC<CategoryImageProps> = ({ category, onPress }) => {
  const navigation = useNavigation<NavigationProp<any>>();

  const handlePress = () => {
    if (onPress) {
      onPress(category);
    } else {
      navigation.navigate("Products", {
        category: category.name.toLowerCase(),
      });
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: category.image }}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />
        <View style={styles.overlay} />
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{category.name}</Text>
        {category.description && (
          <Text style={styles.description} numberOfLines={2}>
            {category.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  imageContainer: {
    position: "relative",
    aspectRatio: 16 / 9,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  content: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    fontSize: 14,
    color: "#f3f4f6",
    lineHeight: 18,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export { CategoryImage };
