const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

module.exports = {
  ...defaultConfig,
  resolver: {
    ...defaultConfig.resolver,
    sourceExts: [
      'js',
      'jsx',
      'json',
      'ts',
      'tsx',
      'cjs',
      'mjs'
    ]
  }
};
