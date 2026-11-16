import { normalizar } from './adapters.js';
import { categoriaInfo } from './categories.js';

export function pesquisarPontos(pontos, busca) {
  const termo = normalizar(busca);
  return pontos.filter(p => !termo || normalizar(p.nome).includes(termo) || normalizar(p.bairro).includes(termo));
}
export function pontoInicial(pontos) {
  return pontos.find(p => normalizar(p.nome) === 'farol da barra') || pontos.find(p => p.imagemUrl) || pontos[0] || null;
}
/** @returns {{titulo: string, icone: any}} */
export function categoriaVisual(categoria) {
  return categoriaInfo(categoria);
}
