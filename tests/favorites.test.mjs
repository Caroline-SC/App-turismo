import assert from 'node:assert/strict';
import { test } from 'node:test';
import { alterarIdsFavoritos, favoritosDoUsuario } from '../services/favorites.js';
import { adaptarPonto, interessesApi } from '../services/adapters.js';
import { categoriaVisual } from '../services/explore.js';
import { createApiClient } from '../services/api.js';
import { alternarPreferencia, opcoesPreferencias } from '../services/profile.js';

test('o perfil usa apenas os IDs da conta atual e mantém favoritos quando o catálogo não carregou', () => {
  const detalhes = [{ id: 'pelourinho', nome: 'Pelourinho' }, { id: 'farol', nome: 'Farol' }];
  assert.deepEqual(favoritosDoUsuario(['pelourinho'], [], detalhes).map(p => p.id), ['pelourinho']);
  assert.deepEqual(favoritosDoUsuario(['farol'], [], detalhes).map(p => p.id), ['farol']);
  assert.deepEqual(favoritosDoUsuario([], detalhes), []);
  assert.equal(favoritosDoUsuario(['removido'], [])[0].indisponivel, true);
});
test('respostas de pontos diferentes preservam as outras alterações e remover não apaga toda a lista', () => {
  let ids = alterarIdsFavoritos([], 'farol', true);
  ids = alterarIdsFavoritos(ids, 'pelourinho', true);
  ids = alterarIdsFavoritos(ids, 'pelourinho', true);
  assert.deepEqual(ids, ['farol', 'pelourinho']);
  assert.deepEqual(alterarIdsFavoritos(ids, 'farol', false), ['pelourinho']);
});
test('rótulos antigos e códigos da API viram palavras completas e preferências equivalentes', () => {
  assert.equal(categoriaVisual('historic').titulo, 'Histórico');
  assert.equal(categoriaVisual('historical').titulo, 'Histórico');
  assert.equal(adaptarPonto({ categorias: ['historic', 'culture'] }).categoria, 'Histórico · Cultural');
  assert.deepEqual(interessesApi(['historic', 'Histórico', 'Cultura']), ['historico', 'cultural']);
});
test('favoritar envia o estado desejado com a sessão, sem escolher outro usuário', async () => {
  let pedido;
  const api = createApiClient({ baseUrl: 'http://api.test', fetchImpl: async (url, options) => { pedido = { url, ...options }; return { ok: true, json: async () => ({ success: true, favoritado: true }) }; } });
  await api.definirFavorito('pelourinho', true);
  assert.equal(pedido.method, 'PUT'); assert.equal(pedido.credentials, 'include');
  assert.deepEqual(JSON.parse(pedido.body), { favoritado: true });
});
test('o perfil mostra preferências adicionais e preserva as outras ao selecionar uma opção', () => {
  const ids = ['historic', 'musica', 'categoria_customizada'];
  const opcoes = opcoesPreferencias(ids);
  assert.ok(opcoes.some(o => o.titulo === 'Música'));
  const natureza = opcoes.find(o => o.titulo === 'Natureza');
  assert.deepEqual(alternarPreferencia(ids, natureza), ['historico', 'musica', 'categoria_customizada', 'natureza']);
  assert.deepEqual(alternarPreferencia(ids, opcoes.find(o => o.ids.includes('categoria_customizada'))), ['historico', 'musica']);
});
