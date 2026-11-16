import { normalizar } from './text.js';

/** @returns {{codigo: string, titulo: string, icone: any}} */
export function categoriaInfo(categoria) {
  const valor = normalizar(categoria);
  if (valor.startsWith('histor')) return { codigo: 'historico', titulo: 'Histórico', icone: 'business-outline' };
  if (valor.startsWith('cultur')) return { codigo: 'cultural', titulo: 'Cultural', icone: 'color-palette-outline' };
  if (valor.startsWith('muse')) return { codigo: 'museu', titulo: 'Museu', icone: 'library-outline' };
  if (valor.startsWith('praia') || valor === 'beach') return { codigo: 'praia', titulo: 'Praia', icone: 'water-outline' };
  if (valor.startsWith('relig')) return { codigo: 'religioso', titulo: 'Religioso', icone: 'sparkles-outline' };
  if (valor.startsWith('nature') || valor === 'natureza') return { codigo: 'natureza', titulo: 'Natureza', icone: 'leaf-outline' };
  if (valor.startsWith('mirante')) return { codigo: 'mirante', titulo: 'Mirante', icone: 'telescope-outline' };
  if (valor.startsWith('gastronom')) return { codigo: 'gastronomia', titulo: 'Gastronomia', icone: 'restaurant-outline' };
  if (valor.startsWith('arquitet') || valor.startsWith('architect')) return { codigo: 'arquitetura', titulo: 'Arquitetura', icone: 'business-outline' };
  if (valor.startsWith('compra')) return { codigo: 'compras', titulo: 'Compras', icone: 'bag-outline' };
  if (valor.startsWith('boemi')) return { codigo: 'boemia', titulo: 'Boemia', icone: 'wine-outline' };
  if (valor.startsWith('music')) return { codigo: 'musica', titulo: 'Música', icone: 'musical-notes-outline' };
  const titulo = String(categoria || 'Ponto turístico').trim().replace(/[_-]+/g, ' ');
  return { codigo: valor, titulo: titulo.charAt(0).toUpperCase() + titulo.slice(1), icone: 'compass-outline' };
}
