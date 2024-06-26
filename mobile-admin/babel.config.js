module.exports = function (api) {
  api.cache(true);
  return {
    plugins: ["relay", "react-native-reanimated/plugin"],
    presets: ["babel-preset-expo"],
  };
};
