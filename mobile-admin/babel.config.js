module.exports = function (api) {
  api.cache(true);
  return {
    plugins: ["relay", "react-native-reanimated/plugin"],
    presets: [
      [
        "babel-preset-expo",
        {
          "react-compiler": {
            // Passed directly to the React Compiler Babel plugin.
            compilationMode: "strict",
            panicThreshold: "all_errors",
          },
        },
      ],
    ],
  };
};
