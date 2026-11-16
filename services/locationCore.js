// Permiss?es e aquisi??o isoladas para testar sem acessar GPS real.
export function criarLocalizador(Location) {
let ultima = null;
async function posicaoAtual() {
  let timer;
  try {
    return await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('tempo')), 12000); }),
    ]);
  } finally { clearTimeout(timer); }
}
async function localizar(solicitarNovamente = false) {
  let permissao = await Location.getForegroundPermissionsAsync();
  if (permissao.status === 'undetermined' || (solicitarNovamente && permissao.canAskAgain && !permissao.granted)) {
    permissao = await Location.requestForegroundPermissionsAsync();
  }
  if (!permissao.granted) return { coords: null, status: 'negada', mensagem: 'Ative a localização para ver o que está mais perto.', podeSolicitar: permissao.canAskAgain };
  if (!await Location.hasServicesEnabledAsync()) return { coords: null, status: 'desativada', mensagem: 'Ligue a localização do aparelho para encontrar lugares próximos.', podeSolicitar: true };
  if (!solicitarNovamente && ultima && Date.now() - ultima.hora < 60000) return ultima.resultado;
  let posicao;
  try { posicao = await posicaoAtual(); }
  catch { posicao = await Location.getLastKnownPositionAsync({ maxAge: 120000, requiredAccuracy: 1000 }); }
  if (!posicao) return { coords: null, status: 'indisponivel', mensagem: 'Localização indisponível agora. Toque no alvo para tentar de novo.', podeSolicitar: true };
  const resultado = { coords: { latitude: posicao.coords.latitude, longitude: posicao.coords.longitude }, status: 'concedida', mensagem: 'Lugares ordenados pela distância de você.', podeSolicitar: true };
  ultima = { resultado, hora: Date.now() };
  return resultado;
}

return localizar;
}
