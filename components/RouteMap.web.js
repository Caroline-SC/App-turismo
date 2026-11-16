import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function RouteMap({ origem, destino, rota, seguindo, centralizar, chegou, padding, aoMoverMapa, aoAncorar }) {
  const frame = useRef(null), dados = useRef(null);
  const [erro, setErro] = useState(false);
  const enviar = useCallback(() => frame.current?.contentWindow?.postMessage({ tipo: 'citouur-rota', ...dados.current }, window.location.origin), []);
  useEffect(() => { dados.current = { origem, destino, rota, seguindo, centralizar, chegou, padding }; enviar(); }, [origem, destino, rota, seguindo, centralizar, chegou, padding, enviar]);
  useEffect(() => {
    const receber = e => {
      if (e.origin !== window.location.origin || e.source !== frame.current?.contentWindow) return;
      if (e.data?.tipo === 'citouur-pronto') enviar();
      if (e.data?.tipo === 'citouur-ancora') aoAncorar(e.data.ponto);
      if (e.data?.tipo === 'citouur-moveu') aoMoverMapa();
      if (e.data?.tipo === 'citouur-erro') setErro(true);
    };
    window.addEventListener('message', receber);
    return () => window.removeEventListener('message', receber);
  }, [aoAncorar, aoMoverMapa, enviar]);
  return <View style={StyleSheet.absoluteFill}><iframe ref={frame} title="Mapa do roteiro" src="/route-map.html" onLoad={enviar} style={{ width: '100%', height: '100%', border: 0 }} />{erro && <View style={styles.erro}><Text style={styles.texto}>O mapa não carregou. Confira a conexão ou abra o trajeto no Google Maps.</Text></View>}</View>;
}
const styles = StyleSheet.create({ erro: { position: 'absolute', left: 25, right: 25, top: '32%', padding: 18, borderRadius: 18, backgroundColor: '#ffffff' }, texto: { color: '#526d76', lineHeight: 22, textAlign: 'center' } });
