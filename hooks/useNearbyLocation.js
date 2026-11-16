import { useEffect, useRef, useState } from 'react';
import { AppState, Linking } from 'react-native';
import { localizar } from '../services/location';

export function useNearbyLocation() {
  const [localizacao, setLocalizacao] = useState({ coords: null, status: 'obtendo', mensagem: 'Encontrando lugares perto de você…', podeSolicitar: true });
  const montado = useRef(false);
  useEffect(() => {
    montado.current = true;
    let ativo = true;
    localizar().then(r => { if (ativo) setLocalizacao(r); }).catch(() => { if (ativo) setLocalizacao({ coords: null, status: 'indisponivel', mensagem: 'Não foi possível obter sua localização.', podeSolicitar: true }); });
    const subscription = AppState.addEventListener('change', estado => {
      if (estado === 'active') localizar().then(r => { if (ativo) setLocalizacao(r); }).catch(() => {});
    });
    return () => { ativo = false; montado.current = false; subscription.remove(); };
  }, []);
  const atualizar = async () => {
    if (localizacao.status === 'obtendo') return;
    if (!localizacao.podeSolicitar) { await Linking.openSettings().catch(() => {}); return; }
    setLocalizacao(atual => ({ ...atual, status: 'obtendo', mensagem: 'Buscando sua localização…' }));
    try { const r = await localizar(true); if (montado.current) setLocalizacao(r); }
    catch { if (montado.current) setLocalizacao({ coords: null, status: 'indisponivel', mensagem: 'Localização indisponível. Tente novamente.', podeSolicitar: true }); }
  };
  return { ...localizacao, atualizar };
}
