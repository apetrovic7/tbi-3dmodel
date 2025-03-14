const webpack = require("webpack");

module.exports = {
  webpack: (config) => {
    // Ignore warnings about source maps
    config.ignoreWarnings = [
      (warning) => warning.message.includes("Failed to parse source map"),
    ];

    // Add fallbacks for missing Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback, // Preserve existing fallbacks
      fs: false, // fs is not needed in the browser
      path: require.resolve("path-browserify"),
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"), // Add stream polyfill
    };

    // Add necessary polyfills
    config.plugins = [
      ...config.plugins,
      new webpack.ProvidePlugin({
        process: "process/browser",
        Buffer: ["buffer", "Buffer"],
      }),
    ];

    return config;
  },
};
