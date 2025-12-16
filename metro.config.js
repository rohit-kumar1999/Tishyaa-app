const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add any custom Metro configuration here
// config.resolver.unstable_enableSymlinks = true; // Removed as per expo doctor recommendation

// Configure for better web performance and prevent React root issues
config.transformer.minifierConfig = {
  // Disable some optimizations that might cause issues with React 18
  keep_fnames: true,
};

// Web-specific configuration to prevent multiple root creation
config.resolver.platforms = ["web", "native", "ios", "android"];
config.resolver.alias = {
  "react-native$": "react-native-web",
};

// Disable React Strict Mode for web to prevent double root creation
if (process.env.EXPO_PLATFORM === "web") {
  config.transformer.strictMode = false;
}

module.exports = config;
