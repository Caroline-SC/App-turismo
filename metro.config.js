require('./scripts/network-bootstrap.cjs');
require('./scripts/metro-onedrive.cjs').instalarCorrecao(require('node:fs'), __dirname);
const { instalarMonitoramento, exclusaoDeSaidas } = require('./scripts/metro-watch.cjs');
instalarMonitoramento(require('@expo/metro-file-map/build/watchers/FallbackWatcher').default, __dirname);
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
config.maxWorkers = 2;
const bloqueados = config.resolver.blockList;
config.resolver.blockList = [...(Array.isArray(bloqueados) ? bloqueados : bloqueados ? [bloqueados] : []), exclusaoDeSaidas(__dirname)];
const original = config.transformer.getTransformOptions;
config.transformer.getTransformOptions = async (...args) => {
  const options = await original?.(...args) || {};
  return { ...options, transform: { ...options.transform, inlineRequires: true } };
};
module.exports = config;
