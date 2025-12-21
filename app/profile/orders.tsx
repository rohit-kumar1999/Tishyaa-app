import { Stack } from "expo-router";
import ProfileOrdersScreen from "../../src/screens/Profile/OrdersScreen";

export default function OrdersScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ProfileOrdersScreen />
    </>
  );
}
