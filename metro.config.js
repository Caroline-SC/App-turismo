const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
config.maxWorkers = 2;
const original = config.transformer.getTransformOptions;
config.transformer.getTransformOptions = async (...args) => {
  const options = await original?.(...args) || {};
  return { ...options, transform: { ...options.transform, inlineRequires: true } };
};
module.exports = config;
