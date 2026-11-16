export function coordenadaValida(p) {
  return p && Number.isFinite(p.latitude) && Number.isFinite(p.longitude) && Math.abs(p.latitude) <= 90 && Math.abs(p.longitude) <= 180;
}
export function distanciaKm(a, b) {
  const rad = n => n * Math.PI / 180;
  const v = Math.sin(rad(b.latitude - a.latitude) / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(rad(b.longitude - a.longitude) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(Math.min(1, v)));
}
export function ordenarPorProximidade(pontos, origem) {
  const lista = pontos.map(p => ({ ...p, distanciaKm: coordenadaValida(origem) && coordenadaValida(p) ? distanciaKm(origem, p) : null }));
  return coordenadaValida(origem) ? lista.sort((a, b) => (a.distanciaKm ?? Infinity) - (b.distanciaKm ?? Infinity)) : lista;
}
export function formatarDistancia(km) {
  if (!Number.isFinite(km)) return null;
  if (km < 0.05) return 'Aqui perto';
  return km < 1 ? `${Math.round(km * 100) * 10} m` : `${km.toFixed(1).replace('.', ',')} km`;
}

const FOTO_LARGO = {
  arquivoInexistente: 'Largo_de_Santana_-_Rio_Vermelho_-_Salvador.jpg',
  arquivo: 'Largo_de_Santana_Salvador-5077.jpg',
  url: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Largo_de_Santana_Salvador-5077.jpg',
  autor: 'Paul R. Burley',
  licenca: 'CC BY-SA 4.0',
  pagina: 'https://commons.wikimedia.org/wiki/File:Largo_de_Santana_Salvador-5077.jpg',
};

function fotoDoLargo(u) {
  return ['upload.wikimedia.org', 'thumb.wikimedia.org'].includes(u.hostname)
    && u.pathname.split('/').some(parte => parte === FOTO_LARGO.arquivoInexistente || parte === FOTO_LARGO.arquivo);
}

export function creditoFoto(url) {
  try { return fotoDoLargo(new URL(url)) ? FOTO_LARGO : null; } catch { return null; }
}

export function fotoCard(url, largura = 500) {
  if (!url) return null;
  try {
    let u = new URL(String(url).trim());
    if (!['https:', 'http:'].includes(u.protocol)) return null;
    // Corrige somente o endereço comprovadamente inexistente da planilha.
    // Uma nova foto cadastrada para este ponto continua sendo respeitada.
    if (fotoDoLargo(u) && u.pathname.split('/').includes(FOTO_LARGO.arquivoInexistente)) u = new URL(FOTO_LARGO.url);
    const partes = u.pathname.split('/');
    const commons = partes.indexOf('commons');
    const wikimedia = ['upload.wikimedia.org', 'thumb.wikimedia.org'].includes(u.hostname);
    // Wikimedia recusa tamanhos arbitrários (por exemplo, 640px retorna HTTP 400).
    const tamanho = [250, 500, 960, 1280, 1920].find(n => n >= largura) || 1920;
    if (wikimedia) { u.hostname = 'upload.wikimedia.org'; u.search = ''; u.hash = ''; }
    if (wikimedia && commons !== -1 && partes.includes('thumb')) {
      u.pathname = u.pathname.replace(/\/\d+px-([^/]+)$/, `/${tamanho}px-$1`);
    } else if (wikimedia && commons !== -1 && /\.(jpg|jpeg|png|webp)$/i.test(u.pathname)) {
      const nome = partes.at(-1);
      partes.splice(commons + 1, 0, 'thumb');
      u.pathname = `${partes.join('/')}/${tamanho}px-${nome}`;
    }
    return u.toString();
  } catch { return null; }
}
export function fotosDoPonto(url, largura = 500) {
  const principal = fotoCard(url, largura);
  if (!principal) return [];
  const u = new URL(principal);
  if (u.hostname !== 'upload.wikimedia.org') return [principal];
  u.hostname = 'thumb.wikimedia.org';
  return [principal, u.toString()];
}

export const IDENTIFICACAO_FOTOS = 'Citour/1.0 (+https://github.com/Caroline-SC/App-turismo)';

// O Android usa um User-Agent genérico (okhttp), recusado pela Wikimedia com
// HTTP 403. No navegador, mantemos a identificação enviada pelo próprio browser.
/** @returns {import('react-native').ImageURISource | undefined} */
export function fonteFoto(uri, plataforma = 'web', recarregar = false) {
  if (!uri) return undefined;
  const wikimedia = ['upload.wikimedia.org', 'thumb.wikimedia.org'].includes(new URL(uri).hostname);
  return {
    uri,
    ...(wikimedia && plataforma !== 'web' ? { headers: { 'User-Agent': IDENTIFICACAO_FOTOS } } : {}),
    ...(plataforma === 'ios' && recarregar ? { cache: 'reload' } : {}),
  };
}
