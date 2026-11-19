import { interessesApi, normalizar } from './adapters.js';

export const PERGUNTAS_ROTEIRO = ['Qual é o destino?', 'O que você gosta de conhecer?', 'Tem algum lugar que não pode faltar?', 'Qual é o horário do passeio?', 'Quantas pessoas vão participar?', 'Como vocês vão se deslocar?', 'Quantos dias terá o roteiro?'];
export function erroEtapa(etapa, dados) {
  if (etapa === 0 && normalizar(dados.cidade) !== 'salvador') return 'Neste momento, os roteiros estão disponíveis para Salvador.';
  if (etapa === 2 && !dados.interesses.length && !dados.pontosEscolhidos.length) return 'Escolha um ponto turístico ou volte para selecionar seus interesses.';
  if (etapa === 3) {
    if (![dados.horaInicio, dados.horaFim].every(h => /^([01]\d|2[0-3]):[0-5]\d$/.test(h))) return 'Informe os horários no formato HH:mm, como 09:00.';
    const minutos = h => Number(h.slice(0, 2)) * 60 + Number(h.slice(3));
    if (minutos(dados.horaFim) - minutos(dados.horaInicio) < 120) return 'Escolha pelo menos duas horas, com o fim depois do início no mesmo dia.';
  }
  if (etapa === 4 && (!/^\d+$/.test(String(dados.pessoas)) || Number(dados.pessoas) < 1 || Number(dados.pessoas) > 100)) return 'Informe entre 1 e 100 pessoas.';
  if (etapa === 5 && !['a_pe', 'carro'].includes(dados.transporte)) return 'Escolha como pretende se deslocar.';
  if (etapa === 6) {
    if (dados.nome != null && (typeof dados.nome !== 'string' || dados.nome.trim().length > 120)) return 'O nome do roteiro deve ter até 120 caracteres.';
    if (!/^\d+$/.test(String(dados.dias)) || Number(dados.dias) < 1 || Number(dados.dias) > 14) return 'Escolha entre 1 e 14 dias.';
    if (!dados.interesses.length && !dados.pontosEscolhidos.length) return 'Escolha pelo menos um interesse ou um ponto turístico nas etapas anteriores.';
    if (dados.pontosEscolhidos.length > Number(dados.dias) * 5) return 'O roteiro permite até cinco pontos por dia. Aumente os dias ou remova alguns lugares.';
  }
  return '';
}
export function pedidoDoFormulario(dados) {
  for (let etapa = 0; etapa < PERGUNTAS_ROTEIRO.length; etapa++) {
    const erro = erroEtapa(etapa, dados);
    if (erro) throw new Error(erro);
  }
  return { nome: dados.nome?.trim() || `Passeio em ${dados.cidade.trim()}`, dias: Number(dados.dias), pessoas: Number(dados.pessoas), horaInicio: dados.horaInicio, horaFim: dados.horaFim,
    transporte: dados.transporte, interesses: interessesApi(dados.interesses), pontosObrigatorios: dados.pontosEscolhidos.map(p => p.id) };
}
