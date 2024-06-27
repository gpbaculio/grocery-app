module.exports = function (api) {
  api.cache(true);
  return {
    plugins: [
      "babel-plugin-react-compiler",
      "relay",
      "react-native-reanimated/plugin",
    ],
    presets: ["babel-preset-expo"],
  };
};
