export const normalizar = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const INTERESSES = {
  historico: ['historico'], cultura: ['cultural'], praias: ['praia'], gastronomia: ['gastronomia'], museus: ['museu'],
  religioso: ['religioso'], boemia: ['boemia'], natureza: ['natureza'], compras: ['compras'], arquitetura: ['arquitetura'],
  'historia colonial': ['historico'], 'cultura afro-baiana': ['cultural'], 'praias e mirantes': ['praia', 'mirante'],
  'gastronomia tipica': ['gastronomia'], 'igrejas e fe': ['religioso'], 'museus e artes': ['museu', 'cultural'], 'musica e boemia': ['musica', 'boemia'],
};
export const interessesApi = lista => [...new Set(lista.flatMap(x => INTERESSES[normalizar(x)] || [normalizar(x)]))];
export function adaptarPonto(p) {
  return { ...p, descricaoCurta: p.historiaResumida || '', resumo: p.historiaResumida || 'Resumo não informado.',
    categoria: (p.categorias || []).join(' · '), distancia: 'Distância não calculada',
    comoChegar: Number.isFinite(p.latitude) && Number.isFinite(p.longitude) ? `Coordenadas: ${p.latitude}, ${p.longitude}` : 'Localização não informada.',
    precoInfo: p.gratuito ? 'Entrada gratuita.' : p.precoPorPessoa != null ? `Ingresso por pessoa: R$ ${p.precoPorPessoa.toFixed(2).replace('.', ',')}.` : 'Entrada paga. Consulte o valor no local.',
    dicas: Array.isArray(p.dicas) ? p.dicas : p.dicas ? [p.dicas] : [],
    historia: (p.historiaLonga || []).map(item => ({ ...item, titulo: item.titulo || '', curiosidade: item.curiosidade || null })) };
}
export function adaptarRoteiro(r) {
  const p = r.plano, parametros = p?.parametros;
  return { ...r, id: r._id, cidade: r.nome, dias: parametros ? `${parametros.dias} ${parametros.dias === 1 ? 'dia' : 'dias'}` : 'Roteiro salvo',
    horario: parametros ? `${parametros.horaInicio} às ${parametros.horaFim}` : '',
    resumo: p ? p.dias.map(d => `${d.titulo}: ${d.paradas.map(s => `${s.inicio}–${s.fim} ${s.nome}`).join(' → ')}`).join('\n\n') : 'Toque para consultar o roteiro completo.' };
}
