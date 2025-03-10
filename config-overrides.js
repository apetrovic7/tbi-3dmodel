module.exports = {
    webpack: (config) => {
      config.ignoreWarnings = [
        (warning) => warning.message.includes('Failed to parse source map')
      ];
      return config;
    },
  };
  