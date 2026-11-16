import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { AppState, Linking } from 'react-native';
import * as Location from 'expo-location';

export function useLiveLocation(ativado) {
  const [estado, setEstado] = useState({ coords: null, status: 'obtendo', erro: '', configuracoes: false });
  const [tentativa, setTentativa] = useState(0);
  useFocusEffect(useCallback(() => {
    if (!ativado) return;
    let ativo = true, geracao = 0, subscription;
    const parar = () => { geracao++; subscription?.remove(); subscription = null; };
    const iniciar = async () => {
      parar(); const versao = geracao;
      try {
        let permissao = await Location.getForegroundPermissionsAsync();
        if (permissao.status === 'undetermined' || (!permissao.granted && permissao.canAskAgain && tentativa > 0)) permissao = await Location.requestForegroundPermissionsAsync();
        if (!ativo || versao !== geracao) return;
        if (!permissao.granted) { setEstado(e => ({ ...e, status: 'negada', erro: 'Ative a localização para acompanhar o trajeto.', configuracoes: !permissao.canAskAgain })); return; }
        if (!await Location.hasServicesEnabledAsync()) { setEstado(e => ({ ...e, status: 'desativada', erro: 'Ligue o GPS do aparelho para acompanhar sua posição.' })); return; }
        if (!ativo || versao !== geracao) return;
        const nova = await Location.watchPositionAsync({ accuracy: Location.Accuracy.High, timeInterval: 2500, distanceInterval: 0 }, local => {
          if (ativo && versao === geracao) setEstado({ coords: { ...local.coords, timestamp: local.timestamp }, status: 'concedida', erro: '', configuracoes: false });
        }, erro => { if (ativo && versao === geracao) setEstado(e => ({ ...e, status: 'erro', erro: 'Não foi possível atualizar o GPS. ' + erro })); });
        if (!ativo || versao !== geracao) nova.remove(); else subscription = nova;
      } catch { if (ativo && versao === geracao) setEstado(e => ({ ...e, status: 'erro', erro: 'Não foi possível acessar sua localização. Tente novamente.' })); }
    };
    iniciar();
    const app = AppState.addEventListener('change', situacao => { if (situacao === 'active') iniciar(); else parar(); });
    return () => { ativo = false; parar(); app.remove(); };
  }, [ativado, tentativa]));
  return { ...estado, atualizar: () => estado.configuracoes ? Linking.openSettings().catch(() => {}) : setTentativa(t => t + 1) };
}
