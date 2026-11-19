import assert from 'node:assert/strict';
import { test } from 'node:test';
import { erroEtapa, pedidoDoFormulario, PERGUNTAS_ROTEIRO } from '../services/itineraryForm.js';
const dados = { cidade: 'Salvador', dias: '3', pessoas: '2', horaInicio: '14:00', horaFim: '18:00', transporte: 'a_pe', interesses: ['História Colonial'], pontosEscolhidos: [{ id: 'pelourinho', nome: 'Pelourinho' }] };

test('etapas validam horários, grupo e dias e permitem escolher os lugares sem interesses', () => {
  assert.equal(PERGUNTAS_ROTEIRO.length, 7);
  assert.equal(erroEtapa(3, dados), '');
  assert.ok(erroEtapa(3, { ...dados, horaFim: '15:00' }));
  assert.ok(erroEtapa(3, { ...dados, horaFim: '02:00' }));
  assert.ok(erroEtapa(3, { ...dados, horaInicio: '25:00' }));
  for (const pessoas of ['0', '101', '1.5', '']) assert.ok(erroEtapa(4, { ...dados, pessoas }));
  for (const dias of ['0', '15', '', '2.5']) assert.ok(erroEtapa(6, { ...dados, dias }));
  assert.equal(erroEtapa(6, { ...dados, interesses: [] }), '');
  assert.ok(erroEtapa(6, { ...dados, interesses: [], pontosEscolhidos: [] }));
  assert.ok(erroEtapa(6, { ...dados, dias: '1', pontosEscolhidos: Array.from({ length: 6 }, (_, i) => ({ id: String(i) })) }));
});

test('última etapa transforma o seletor em números e envia os IDs reais sem mudar as respostas', () => {
  const original = structuredClone(dados);
  assert.deepEqual(pedidoDoFormulario(dados), { nome: 'Passeio em Salvador', dias: 3, pessoas: 2, horaInicio: '14:00', horaFim: '18:00', transporte: 'a_pe', interesses: ['historico'], pontosObrigatorios: ['pelourinho'] });
  assert.deepEqual(dados, original);
  assert.throws(() => pedidoDoFormulario({ ...dados, pessoas: '0' }));
});

test('nome escolhido segue para a API, com espaços tratados e limite de 120 caracteres', () => {
  assert.equal(pedidoDoFormulario({ ...dados, nome: '  Férias com a família  ' }).nome, 'Férias com a família');
  assert.equal(pedidoDoFormulario({ ...dados, nome: '   ' }).nome, 'Passeio em Salvador');
  assert.equal(pedidoDoFormulario({ ...dados, nome: 'a'.repeat(120) }).nome.length, 120);
  assert.throws(() => pedidoDoFormulario({ ...dados, nome: 'a'.repeat(121) }), /120 caracteres/);
  assert.throws(() => pedidoDoFormulario({ ...dados, nome: {} }), /nome/);
});

