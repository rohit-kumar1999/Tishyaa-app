import { Stack } from "expo-router";
import { Text, View } from "react-native";

export default function PreferencesScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Preferences",
          headerShown: true,
        }}
      />
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Preferences Screen</Text>
      </View>
    </>
  );
}
