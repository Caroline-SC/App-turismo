import { interessesApi } from './adapters.js';
import { categoriaInfo } from './categories.js';

const TITULOS = ['Histórico', 'Cultura', 'Praias', 'Gastronomia', 'Museus', 'Religioso', 'Boemia', 'Natureza', 'Compras', 'Arquitetura'];
export function opcoesPreferencias(interesses) {
  const basicas = TITULOS.map(titulo => ({ titulo, ids: interessesApi([titulo]) }));
  const conhecidos = new Set(basicas.flatMap(opcao => opcao.ids));
  const extras = interessesApi(interesses).filter(id => !conhecidos.has(id)).map(id => ({ titulo: categoriaInfo(id).titulo, ids: [id] }));
  return [...basicas, ...extras];
}
export function alternarPreferencia(interesses, opcao) {
  const ids = interessesApi(interesses);
  return opcao.ids.some(id => ids.includes(id)) ? ids.filter(id => !opcao.ids.includes(id)) : [...new Set([...ids, ...opcao.ids])];
}
