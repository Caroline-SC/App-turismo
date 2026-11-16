import assert from 'node:assert/strict';
import { test } from 'node:test';
import { chegadaConfirmada, fimDaVisita, tarefasDoDia, posicaoNoTrajeto, enriquecerParada } from '../services/trip.js';
import { createApiClient } from '../services/api.js';
import { adaptarRoteiro } from '../services/adapters.js';

test('a chegada exige GPS recente e preciso e não confirma restaurante ainda não escolhido', () => {
  const agora = 100000, destino = { latitude: -12.97, longitude: -38.5 };
  const posicao = { ...destino, accuracy: 12, timestamp: agora - 2000 };
  assert.equal(chegadaConfirmada(posicao, destino, agora), true);
  assert.equal(chegadaConfirmada({ ...posicao, accuracy: 300 }, destino, agora), false);
  assert.equal(chegadaConfirmada({ ...posicao, timestamp: agora - 60000 }, destino, agora), false);
  assert.equal(chegadaConfirmada({ ...posicao, latitude: -12.99 }, destino, agora), false);
  assert.equal(chegadaConfirmada(posicao, { ...destino, tipo: 'almoco', localConfirmado: false }, agora), false);
});
test('a permanência usa a hora real de chegada e o tempo do grupo', () => {
  assert.equal(fimDaVisita('2026-11-16T13:00:00Z', 75).toISOString(), '2026-11-16T14:15:00.000Z');
  assert.equal(fimDaVisita(null, 30), null);
});
test('linha do tempo mantém deslocamentos, espera, almoço e imagem atual do catálogo', () => {
  const parada = { tipo: 'almoco', localId: 'comercial:0', esperaMinutos: 10 };
  const tarefas = tarefasDoDia({ paradas: [parada], trechos: [{ destinoId: 'comercial:0', duracaoMinutos: 5 }] });
  assert.deepEqual(tarefas.map(t => t.tipo), ['deslocamento', 'espera', 'almoco']);
  assert.equal(enriquecerParada({ pontoId: 'pelourinho', nome: 'Nome salvo' }, [{ id: 'pelourinho', imagemUrl: 'foto-nova' }]).imagemUrl, 'foto-nova');
});
test('o progresso na geometria escolhe a próxima manobra e detecta desvio sem criar caminhos fictícios', () => {
  const rota = { geometria: { coordinates: [[0, 0], [0.001, 0], [0.001, 0.001]] }, distanciaMetros: 222.64, duracaoSegundos: 180,
    instrucoes: [{ inicioMetros: 0, fimMetros: 111.32, manobra: { type: 'depart' } }, { inicioMetros: 111.32, fimMetros: 222.64, manobra: { type: 'turn', modifier: 'right' }, rua: 'Rua A' }] };
  const posicao = posicaoNoTrajeto(rota, { latitude: 0, longitude: 0.0005 });
  assert.ok(Math.abs(posicao.distanciaRestante - 166.98) < 1);
  assert.equal(posicao.instrucao, 'Vire à direita');
  assert.ok(posicaoNoTrajeto(rota, { latitude: 0.01, longitude: 0.01 }).distanciaDaRota > 75);
  assert.equal(posicaoNoTrajeto({ geometria: null }, { latitude: 0, longitude: 0 }), null);
});
test('resumos e chamadas de progresso mantêm usuário, versão e parada correta', async () => {
  const resumo = adaptarRoteiro({ _id: 'r', nome: 'Passeio', resumo: { dias: 2, horaInicio: '09:00', horaFim: '18:00', pontos: ['Pelourinho', 'Farol'] } });
  assert.equal(resumo.dias, '2 dias'); assert.equal(resumo.resumo, 'Pelourinho → Farol');
  const chamadas = [];
  const api = createApiClient({ baseUrl: 'http://api.test', fetchImpl: async (url, options) => { chamadas.push({ url, ...options }); return { ok: true, status: 200, json: async () => ({ success: true }) }; } });
  await api.progressoRoteiro('r', { acao: 'proximo', versao: 3 });
  await api.trajetoRoteiro('r', { dia: 1, parada: 2, origem: { latitude: 0, longitude: 0 } });
  assert.equal(chamadas[0].method, 'PATCH'); assert.equal(chamadas[0].credentials, 'include');
  assert.deepEqual(JSON.parse(chamadas[0].body), { acao: 'proximo', versao: 3 });
  assert.equal(chamadas[1].url, 'http://api.test/api/roteiros/r/trajeto');
});
