import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ordenarPorProximidade, formatarDistancia, fotoCard, fotosDoPonto, fonteFoto, creditoFoto, IDENTIFICACAO_FOTOS } from '../services/nearby.js';
import { criarLocalizador } from '../services/locationCore.js';

test('ordena pela posição real sem mutar catálogo e deixa coordenadas ausentes no fim', () => {
  const pontos = [{ id: 'longe', latitude: -13, longitude: -38.5 }, { id: 'sem', latitude: null, longitude: null }, { id: 'aqui', latitude: -12.97, longitude: -38.5 }];
  const ordenados = ordenarPorProximidade(pontos, { latitude: -12.97, longitude: -38.5 });
  assert.deepEqual(ordenados.map(p => p.id), ['aqui', 'longe', 'sem']);
  assert.equal(ordenados[0].distanciaKm, 0);
  assert.equal(pontos[0].id, 'longe');
  assert.deepEqual(ordenarPorProximidade(pontos, null).map(p => p.id), ['longe', 'sem', 'aqui']);
  assert.equal(formatarDistancia(null), null);
  assert.equal(formatarDistancia(0.4), '400 m');
});
test('foto usa miniatura do próprio ponto e recusa esquemas inválidos', () => {
  assert.equal(fotoCard('https://upload.wikimedia.org/wikipedia/commons/a/ab/Foto.jpg'), 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Foto.jpg/500px-Foto.jpg');
  assert.equal(fotoCard('https://upload.wikimedia.org/wikipedia/commons/a/ab/Foto.jpg', 640), 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Foto.jpg/960px-Foto.jpg');
  assert.equal(fotoCard('https://upload.wikimedia.org/wikipedia/commons/a/ab/Foto.jpg', 960), 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Foto.jpg/960px-Foto.jpg');
  assert.equal(fotoCard('javascript:alert(1)'), null);
  assert.equal(fotoCard(null), null);
});
test('a URL real do Pelourinho aceita o host thumb, remove rastreamento e usa tamanhos válidos', () => {
  const caminho = '/wikipedia/commons/thumb/c/cc/Pelourinho_Salvador_Bahia_2018-0608.jpg/';
  const arquivo = 'Pelourinho_Salvador_Bahia_2018-0608.jpg';
  const url = 'https://thumb.wikimedia.org' + caminho + '960px-' + arquivo + '?utm_source=commons.wikimedia.org&utm_campaign=imageinfo';
  assert.equal(fotoCard(url), 'https://upload.wikimedia.org' + caminho + '500px-' + arquivo);
  assert.equal(fotoCard(url, 960), 'https://upload.wikimedia.org' + caminho + '960px-' + arquivo);
  assert.equal(fotosDoPonto(url, 960)[1], 'https://thumb.wikimedia.org' + caminho + '960px-' + arquivo);
  assert.equal(fotoCard('https://example.com/foto.jpg?signature=abc'), 'https://example.com/foto.jpg?signature=abc');
});

test('fotos nativas da Wikimedia identificam o Citour; navegador e outros provedores mantêm suas requisições', () => {
  const uri = fotoCard('https://upload.wikimedia.org/wikipedia/commons/a/ab/Foto.jpg');
  assert.equal(fonteFoto(uri, 'android').headers['User-Agent'], IDENTIFICACAO_FOTOS);
  assert.equal(fonteFoto(uri, 'ios').headers['User-Agent'], IDENTIFICACAO_FOTOS);
  assert.deepEqual(fonteFoto(uri, 'web'), { uri });
  const outra = 'https://exemplo.org/foto.jpg?signature=abc';
  assert.deepEqual(fonteFoto(outra, 'android'), { uri: outra });
  assert.equal(fonteFoto(null, 'android'), undefined);
  assert.equal(fonteFoto(uri, 'ios', true).cache, 'reload');
});

test('o link inexistente do Rio Vermelho recebe uma foto do próprio lugar sem substituir novas fotos cadastradas', () => {
  const antigo = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Largo_de_Santana_-_Rio_Vermelho_-_Salvador.jpg/800px-Largo_de_Santana_-_Rio_Vermelho_-_Salvador.jpg';
  assert.equal(fotoCard(antigo), 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Largo_de_Santana_Salvador-5077.jpg/500px-Largo_de_Santana_Salvador-5077.jpg');
  assert.equal(creditoFoto(antigo).autor, 'Paul R. Burley');
  assert.equal(creditoFoto(fotoCard(antigo)).licenca, 'CC BY-SA 4.0');
  assert.equal(fotoCard('https://outro.exemplo/foto-nova.jpg'), 'https://outro.exemplo/foto-nova.jpg');
  assert.equal(creditoFoto('https://outro.exemplo/foto-nova.jpg'), null);
});
function mockLocation(status = 'undetermined', ativo = true) {
  const chamadas = { pedir: 0, gps: 0 };
  return { chamadas, api: {
    Accuracy: { Balanced: 3 },
    getForegroundPermissionsAsync: async () => ({ status, granted: status === 'granted', canAskAgain: status !== 'denied' }),
    requestForegroundPermissionsAsync: async () => { chamadas.pedir++; return { granted: true, status: 'granted', canAskAgain: true }; },
    hasServicesEnabledAsync: async () => ativo,
    getCurrentPositionAsync: async () => { chamadas.gps++; return { coords: { latitude: -12.97, longitude: -38.5 } }; },
    getLastKnownPositionAsync: async () => null,
  } };
}
test('pede permissão antes de obter GPS e reaproveita localização recente', async () => {
  const { api, chamadas } = mockLocation();
  const localizar = criarLocalizador(api);
  assert.equal((await localizar()).status, 'concedida');
  assert.equal(chamadas.pedir, 1);
  assert.equal(chamadas.gps, 1);
  await localizar();
  assert.equal(chamadas.gps, 1);
  await localizar(true);
  assert.equal(chamadas.gps, 2);
});
test('permissão negada e GPS desligado não impedem navegação nem inventam coordenadas', async () => {
  const negada = mockLocation('denied');
  const r = await criarLocalizador(negada.api)();
  assert.equal(r.coords, null); assert.equal(r.status, 'negada');
  assert.equal(negada.chamadas.gps, 0); assert.equal(negada.chamadas.pedir, 0);
  const desligado = await criarLocalizador(mockLocation('granted', false).api)();
  assert.equal(desligado.status, 'desativada');
});
