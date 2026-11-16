import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolverEndereco } from '../services/apiAddress.js';
import network from '../scripts/start-expo.cjs';

test('celular segue o IP do Expo; navegador usa o próprio hostname', () => {
  assert.equal(resolverEndereco({ configurado: 'auto', plataforma: 'android', hostExpo: '192.168.1.110:8081' }), 'http://192.168.1.110:5000');
  assert.equal(resolverEndereco({ configurado: 'auto', plataforma: 'web', hostname: 'localhost' }), 'http://localhost:5000');
  assert.equal(resolverEndereco({ plataforma: 'android', hostExpo: '127.0.0.1:8081' }), 'http://10.0.2.2:5000');
  assert.equal(resolverEndereco({ configurado: 'https://api.example', plataforma: 'web', hostname: 'localhost' }), 'https://api.example');
  assert.throws(() => resolverEndereco({ plataforma: 'android', hostExpo: 'abc.exp.direct:80' }), /modo LAN/);
});
test('seleção LAN ignora Radmin VPN e endereços sem rede', () => {
  assert.equal(network.selecionarHost({ vpn: [{ family: 'IPv4', internal: false, address: '26.8.1.245' }], loop: [{ family: 'IPv4', internal: true, address: '127.0.0.1' }], wifi: [{ family: 'IPv4', internal: false, address: '192.168.1.110' }] }), '192.168.1.110');
});
test('inicialização limpa offline herdado sem alterar ambiente do terminal', () => {
  const original = { EXPO_OFFLINE: '1', npm_config_offline: 'true', TESTE: 'ok' };
  const env = network.ambienteExpo(original, '192.168.1.110');
  assert.equal(env.EXPO_OFFLINE, undefined);
  assert.equal(env.npm_config_offline, undefined);
  assert.equal(env.NODE_USE_SYSTEM_CA, '1');
  assert.equal(env.REACT_NATIVE_PACKAGER_HOSTNAME, '192.168.1.110');
  assert.equal(original.EXPO_OFFLINE, '1');
  assert.equal(network.ambienteExpo(original, null, true).EXPO_OFFLINE, '1');
});
