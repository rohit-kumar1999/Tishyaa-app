import { Stack } from "expo-router";
import { Text, View } from "react-native";

export default function OrdersScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "My Orders",
          headerShown: true,
        }}
      />
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Orders Screen</Text>
      </View>
    </>
  );
}
