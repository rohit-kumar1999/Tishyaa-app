import { activateKeepAwake } from "expo-keep-awake";

if (__DEV__) {
  activateKeepAwake();
}

// Import the main App component from expo-router
import "expo-router/entry";
