import assert from 'node:assert/strict';
import { test } from 'node:test';
import { pesquisarPontos, pontoInicial, categoriaVisual } from '../services/explore.js';

const pontos = [
  { id: 'itapua', nome: 'Farol de Itapuã', bairro: 'Itapuã', imagemUrl: 'https://example.com/itapua.jpg' },
  { id: 'barra', nome: 'Farol da Barra', bairro: 'Barra' },
  { id: 'museu', nome: 'Museu de Arte', bairro: 'Vitória' },
];

test('pesquisa nome e bairro sem exigir acentos e preserva o catálogo', () => {
  assert.deepEqual(pesquisarPontos(pontos, ' ITAPUA ').map(p => p.id), ['itapua']);
  assert.deepEqual(pesquisarPontos(pontos, 'vitoria').map(p => p.id), ['museu']);
  assert.deepEqual(pesquisarPontos(pontos, 'farol').map(p => p.id), ['itapua', 'barra']);
  assert.equal(pesquisarPontos(pontos, '').length, 3);
  assert.deepEqual(pesquisarPontos(pontos, 'inexistente'), []);
  assert.equal(pontos[0].id, 'itapua');
});

test('começa pelo Farol da Barra e usa dados disponíveis quando ele não existe', () => {
  assert.equal(pontoInicial(pontos)?.id, 'barra');
  assert.equal(pontoInicial([pontos[2], pontos[0]])?.id, 'itapua');
  assert.equal(pontoInicial([pontos[2]])?.id, 'museu');
  assert.equal(pontoInicial([]), null);
});

test('categorias têm rótulos legíveis e preservam categorias desconhecidas', () => {
  assert.equal(categoriaVisual('historico').titulo, 'Histórico');
  assert.equal(categoriaVisual('cultural').titulo, 'Cultural');
  assert.equal(categoriaVisual('museu').titulo, 'Museu');
  assert.equal(categoriaVisual('Arquitetura').titulo, 'Arquitetura');
});
