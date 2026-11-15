import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createApiClient } from '../services/api.js';
import { adaptarPonto, adaptarRoteiro, interessesApi } from '../services/adapters.js';

test('login envia os nomes de campos do backend e mantém cookies nas chamadas seguintes', async () => {
  const calls = [];
  const client = createApiClient({ baseUrl: 'http://api.test:5000/api/', fetchImpl: async (url, options) => {
    calls.push({ url, ...options }); return { ok: true, status: 200, json: async () => ({ success: true, user: { id: 'u1' } }) };
  } });
  await client.login(' EMAIL@GMAIL.COM ', 'senha');
  await client.toggleFavorito('farol/barra');
  assert.equal(calls[0].url, 'http://api.test:5000/api/users/login');
  assert.deepEqual(JSON.parse(calls[0].body), { email: 'email@gmail.com', password_hash: 'senha' });
  assert.equal(calls[1].credentials, 'include');
  assert.equal(calls[1].method, 'POST');
  assert.equal(calls[1].url, 'http://api.test:5000/api/users/favoritos/farol%2Fbarra');
});

test('sessão expirada invalida autenticação; login incorreto não dispara logout', async () => {
  let expirou = 0;
  const client = createApiClient({ baseUrl: 'http://api.test', onUnauthorized: () => expirou++, fetchImpl: async () => ({ ok: false, status: 401, json: async () => ({ error: 'Sessão inválida' }) }) });
  await assert.rejects(client.profile(), { status: 401 });
  assert.equal(expirou, 1);
  await assert.rejects(client.login('x', 'y'), { status: 401 });
  assert.equal(expirou, 1);
});

test('adapta planilha e roteiro sem depender de pontos fixos', () => {
  const ponto = adaptarPonto({ id: 'real', nome: 'Real', latitude: 0, longitude: 0, categorias: ['historico'], historiaResumida: 'Resumo', dicas: 'Uma dica', historiaLonga: [{ ano: '1549', texto: 'Fundação' }], gratuito: false, precoPorPessoa: null });
  assert.deepEqual(ponto.dicas, ['Uma dica']);
  assert.equal(ponto.historia[0].texto, 'Fundação');
  assert.ok(ponto.comoChegar.includes('0, 0'));
  assert.equal(ponto.descricaoCurta, 'Resumo');
  assert.deepEqual(interessesApi(['História Colonial', 'Cultura Afro-baiana', 'Museus e Artes']), ['historico', 'cultural', 'museu']);
  const roteiro = adaptarRoteiro({ _id: 'r1', nome: 'Passeio', plano: { parametros: { dias: 1, horaInicio: '09:00', horaFim: '18:00' }, dias: [{ titulo: 'Dia 1', paradas: [{ inicio: '09:00', fim: '10:00', nome: 'Real' }] }] } });
  assert.equal(roteiro.id, 'r1');
  assert.ok(roteiro.resumo.includes('Dia 1: 09:00–10:00 Real'));
});

test('erro de geração não vira sucesso e validações do backend são apresentadas', async () => {
  const client = createApiClient({ baseUrl: 'http://api.test', fetchImpl: async () => ({ ok: false, status: 422, json: async () => ({ success: false, error: 'Horário insuficiente' }) }) });
  await assert.rejects(client.criarRoteiro({ dias: 2 }), { status: 422, message: 'Horário insuficiente' });
});
