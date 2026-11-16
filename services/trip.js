import { coordenadaValida, distanciaKm } from './nearby.js';

export const dinheiro = valor => Number.isFinite(valor) ? 'R$ ' + valor.toFixed(2).replace('.', ',') : 'Valor a confirmar';
export const progressoDoRoteiro = r => ({ dia: 0, parada: 0, status: 'pronto', concluidas: [], versao: 0, ...r?.progresso });
export function enriquecerParada(parada, pontos) {
  const ponto = pontos.find(p => p.id === parada.pontoId);
  return { ...ponto, ...parada, id: parada.pontoId || parada.localId, imagemUrl: ponto?.imagemUrl || parada.imagemUrl || null };
}
export function tarefasDoDia(dia) {
  return dia.paradas.flatMap((p, indice) => {
    const trecho = dia.trechos?.find(t => t.destinoId === p.localId);
    return [...(trecho ? [{ tipo: 'deslocamento', trecho, indice }] : []), ...(p.esperaMinutos > 0 ? [{ tipo: 'espera', parada: p, indice }] : []), { tipo: p.tipo, parada: p, indice }];
  });
}
export function fimDaVisita(chegouEm, minutos) {
  const inicio = Date.parse(chegouEm);
  return Number.isFinite(inicio) && Number.isFinite(minutos) ? new Date(inicio + minutos * 60000) : null;
}
export function chegadaConfirmada(posicao, destino, agora = Date.now()) {
  return Boolean(coordenadaValida(posicao) && coordenadaValida(destino) && !(destino.tipo === 'almoco' && !destino.localConfirmado)
    && Number.isFinite(posicao.accuracy) && posicao.accuracy <= 40 && Number.isFinite(posicao.timestamp) && agora - posicao.timestamp <= 20000 && agora >= posicao.timestamp - 5000 && distanciaKm(posicao, destino) <= 0.045);
}
export function textoManobra(manobra = {}) {
  if (manobra.type === 'arrive') return 'Chegue ao destino';
  if (['roundabout', 'rotary'].includes(manobra.type)) return manobra.exit ? `Na rotatória, use a ${manobra.exit}ª saída` : 'Entre na rotatória';
  const lado = String(manobra.modifier || '');
  if (lado.includes('uturn')) return 'Faça o retorno permitido';
  if (lado.includes('left')) return manobra.type === 'fork' ? 'Mantenha-se à esquerda' : 'Vire à esquerda';
  if (lado.includes('right')) return manobra.type === 'fork' ? 'Mantenha-se à direita' : 'Vire à direita';
  return 'Siga em frente';
}
export function posicaoNoTrajeto(rota, posicao) {
  const coords = rota?.geometria?.coordinates;
  if (!coordenadaValida(posicao) || !Array.isArray(coords) || coords.length < 2) return null;
  let melhor = Infinity, percorrido = 0, total = 0, ateMaisProximo = 0;
  const fatorX = 111320 * Math.cos(posicao.latitude * Math.PI / 180), fatorY = 111320;
  for (let i = 0; i < coords.length - 1; i++) {
    const a = coords[i], b = coords[i + 1];
    const ax = (a[0] - posicao.longitude) * fatorX, ay = (a[1] - posicao.latitude) * fatorY;
    const dx = (b[0] - a[0]) * fatorX, dy = (b[1] - a[1]) * fatorY, comprimento = Math.hypot(dx, dy);
    const t = comprimento ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / (comprimento * comprimento))) : 0;
    const distancia = Math.hypot(ax + t * dx, ay + t * dy);
    if (distancia < melhor) { melhor = distancia; ateMaisProximo = percorrido + t * comprimento; }
    percorrido += comprimento; total += comprimento;
  }
  const proporcao = total ? Math.max(0, Math.min(1, ateMaisProximo / total)) : 1;
  const andado = proporcao * rota.distanciaMetros;
  const passos = rota.instrucoes || [];
  const indice = passos.findIndex(p => p.fimMetros > andado + 8);
  const seguinte = passos[indice < 0 ? passos.length - 1 : Math.min(indice + 1, passos.length - 1)];
  return { distanciaDaRota: melhor, distanciaRestante: Math.max(0, rota.distanciaMetros - andado), segundosRestantes: Math.max(0, rota.duracaoSegundos * (1 - proporcao)),
    instrucao: seguinte ? textoManobra(seguinte.manobra) : 'Siga pelo trajeto', rua: seguinte?.rua || '', metrosAteManobra: Math.max(0, (seguinte?.inicioMetros || 0) - andado), manobra: seguinte?.manobra };
}
