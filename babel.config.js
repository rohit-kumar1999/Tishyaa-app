module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./src",
            "@components": "./src/components",
            "@hooks": "./src/hooks",
            "@services": "./src/services",
            "@utils": "./src/utils",
          },
        },
      ],
      // react-native-reanimated/plugin must be listed last
      "react-native-reanimated/plugin",
    ],
  };
};
