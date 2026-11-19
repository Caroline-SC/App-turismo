import assert from 'node:assert/strict';
import { test } from 'node:test';
import { alturaDoTexto } from '../services/textLayout.js';

test('reserva a última linha nativa mesmo quando só contém uma palavra ou um número', () => {
  assert.equal(alturaDoTexto([{ y: 3.4, height: 20 }, { y: 23.4, height: 20 }]), 45);
  assert.equal(alturaDoTexto([{ y: 4, height: 32 }, { y: 36, height: 32 }], 8), 77);
  assert.equal(alturaDoTexto([{ y: 2, height: 16 }]), 19);
});

test('ignora métricas inválidas e admite uma nova medição menor após mudança de texto', () => {
  assert.equal(alturaDoTexto(undefined), 0);
  assert.equal(alturaDoTexto([{ y: NaN, height: 20 }]), 0);
  assert.ok(alturaDoTexto([{ y: 2, height: 20 }]) < alturaDoTexto([{ y: 2, height: 20 }, { y: 22, height: 20 }]));
});
