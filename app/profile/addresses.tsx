import { Stack } from "expo-router";
import { Text, View } from "react-native";

export default function AddressesScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "My Addresses",
          headerShown: true,
        }}
      />
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Addresses Screen</Text>
      </View>
    </>
  );
}
