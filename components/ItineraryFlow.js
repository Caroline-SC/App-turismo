import { useState, useCallback, useRef, useEffect } from 'react';
import { useFocusEffect } from 'expo-router';
import { ActivityIndicator, BackHandler, Keyboard, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import Text from './AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import Navbar from './Navbar';
import { useNavbarHeight } from '../hooks/useNavbarHeight';
import ItineraryWizard from './ItineraryWizard';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { adaptarRoteiro } from '../services/adapters';
import { avisar, confirmar } from '../services/notify';

export default function ItineraryFlow({ aoMudarAba, aoAbrirRoteiro }) {
  const { pontos, carregandoPontos, erroPontos, carregarPontos } = useApp();
  const insets = useSafeAreaInsets();
  const alturaNav = useNavbarHeight();
  const [aba, setAba] = useState('criar'), [gerando, setGerando] = useState(false);
  const [roteiros, setRoteiros] = useState([]), [carregando, setCarregando] = useState(false), [erro, setErro] = useState('');
  const pedido = useRef(0), trava = useRef(false), montado = useRef(true), focada = useRef(true), scroll = useRef(null);
  useEffect(() => { montado.current = true; return () => { montado.current = false; }; }, []);
  useFocusEffect(useCallback(() => { focada.current = true; return () => { focada.current = false; }; }, []));
  useFocusEffect(useCallback(() => {
    if (!gerando) return;
    const assinatura = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => assinatura.remove();
  }, [gerando]));
  const carregarSalvos = useCallback(() => {
    const versao = ++pedido.current;
    setCarregando(true); setErro('');
    api.roteiros().then(r => { if (pedido.current === versao) setRoteiros(r.roteiros.map(adaptarRoteiro)); })
      .catch(e => { if (pedido.current === versao) setErro(e.message); })
      .finally(() => { if (pedido.current === versao) setCarregando(false); });
  }, []);
  useFocusEffect(useCallback(() => {
    if (aba !== 'salvos') return;
    carregarSalvos();
    return () => { pedido.current++; };
  }, [aba, carregarSalvos]));
  const excluir = async roteiro => {
    if (!await confirmar('Excluir roteiro', 'Deseja excluir este roteiro salvo?')) return;
    try { await api.excluirRoteiro(roteiro.id); setRoteiros(atual => atual.filter(r => r.id !== roteiro.id)); }
    catch (e) { avisar('Excluir roteiro', e.message); }
  };
  const gerar = async parametros => {
    if (trava.current) return;
    trava.current = true; Keyboard.dismiss(); setGerando(true);
    try {
      const resposta = await api.criarRoteiro(parametros);
      if (!montado.current) return;
      setRoteiros(atual => [adaptarRoteiro(resposta.roteiro), ...atual]);
      if (focada.current) aoAbrirRoteiro(resposta.roteiro._id);
      else setAba('salvos');
    } catch (e) { if (montado.current) avisar('Não foi possível criar o roteiro', e.message); }
    finally { trava.current = false; if (montado.current) setGerando(false); }
  };
  return <View style={styles.container}>
    <StatusBar barStyle={gerando ? 'dark-content' : 'light-content'} />
    <View style={{ flex: 1 }} accessibilityElementsHidden={gerando} importantForAccessibility={gerando ? 'no-hide-descendants' : 'auto'}>
    <View style={[styles.topo, { paddingTop: insets.top + 24 }]}>
      <View style={styles.cabecalho}><View style={styles.icone}><Ionicons name="sparkles-outline" size={24} color="#ffffff" /></View><View style={{ flex: 1 }}><Text style={styles.titulo}>Roteiros Inteligentes</Text><Text style={styles.subtitulo}>Criação sob medida com Inteligência Artificial</Text></View></View>
      <View style={styles.abas}>{[{ id: 'criar', titulo: 'Criar Novo' }, { id: 'salvos', titulo: 'Meus roteiros' }].map(item => <TouchableOpacity key={item.id} disabled={gerando} onPress={() => { setAba(item.id); scroll.current?.scrollTo({ y: 0, animated: false }); }} style={[styles.aba, aba === item.id && styles.abaAtiva]}><Text style={[styles.abaTexto, aba === item.id && styles.abaTextoAtivo]}>{item.titulo}</Text></TouchableOpacity>)}</View>
    </View>
    <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={[styles.conteudo, { paddingBottom: alturaNav + 25 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={{ display: aba === 'criar' ? 'flex' : 'none', flexGrow: 1 }}>
        <ItineraryWizard pontos={pontos} carregandoPontos={carregandoPontos} erroPontos={erroPontos} aoAtualizar={carregarPontos} aoGerar={gerar} aoMudarEtapa={() => scroll.current?.scrollTo({ y: 0, animated: false })} />
      </View>
      {aba === 'salvos' && <View style={{ gap: 14 }}>
        {!roteiros.length ? <TouchableOpacity style={styles.vazio} disabled={carregando} onPress={carregarSalvos} accessibilityLabel="Atualizar meus roteiros">
          {carregando ? <ActivityIndicator color="#0097b2" /> : <Ionicons name="map-outline" size={44} color="#b0bec5" />}<Text style={styles.vazioTitulo}>{carregando ? 'Carregando roteiros…' : erro ? 'Não foi possível carregar' : 'Nenhum roteiro salvo'}</Text><Text style={styles.vazioTexto}>{erro || 'Crie seu primeiro roteiro personalizado na aba Criar Novo.'}</Text>
        </TouchableOpacity> : roteiros.map(roteiro => <TouchableOpacity key={roteiro.id} style={styles.cardSalvo} onPress={() => aoAbrirRoteiro(roteiro.id)} onLongPress={() => excluir(roteiro)} accessibilityHint="Toque para abrir. Segure para excluir.">
          <View style={styles.topoCardSalvo}><Text style={styles.cidadeSalva}>{roteiro.cidade} · {roteiro.dias}</Text><Text style={styles.horarioSalvo}>{roteiro.horario}</Text></View>
          <Text  style={styles.resumoSalvo}>{roteiro.resumo}</Text><View style={styles.rodapeSalvo}><Text style={styles.progressoSalvo}>{roteiro.progresso?.status === 'concluido' ? 'Dia concluído' : ['em_trajeto', 'visitando', 'pausado'].includes(roteiro.progresso?.status) ? 'Roteiro em andamento' : 'Ver roteiro completo'}</Text><TouchableOpacity onPress={() => excluir(roteiro)} accessibilityLabel={'Excluir ' + roteiro.cidade}><Ionicons name="trash-outline" size={18} color="#d4f2f6" /></TouchableOpacity></View>
        </TouchableOpacity>)}
      </View>}
    </ScrollView>
    <Navbar abaAtiva="itinerary" aoMudarAba={aoMudarAba} />
    </View>
    {gerando && <View style={styles.carregandoTela} accessibilityViewIsModal importantForAccessibility="yes">
      <ScrollView contentContainerStyle={[styles.carregandoCentro, { paddingBottom: alturaNav + 30 }]}><View style={styles.carregandoIcone}><Ionicons name="sparkles" size={45} color="#0097b2" /></View><ActivityIndicator size="large" color="#0097b2" /><Text accessibilityRole="header" accessibilityLiveRegion="polite" style={styles.carregandoTitulo}>Criando roteiro…</Text><Text style={styles.carregandoTexto}>Estamos organizando seus passeios, horários e deslocamentos.</Text><Text style={styles.carregandoLegenda}>Pode levar alguns instantes.</Text></ScrollView>
      <View pointerEvents="none" style={styles.navCarregando}><Navbar abaAtiva="itinerary" /></View>
    </View>}
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f7f9', width: '100%' }, topo: { backgroundColor: '#0097b2', paddingHorizontal: 22, paddingBottom: 22, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }, cabecalho: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18, flexWrap: 'wrap', minWidth: 0, maxWidth: '100%' }, icone: { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }, titulo: { width: '100%', fontSize: 22, fontWeight: 'bold', color: '#ffffff', flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 31 }, subtitulo: { width: '100%', fontSize: 13, color: '#e0f7fa', marginTop: 2, lineHeight: 19, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%' },
  abas: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 12, padding: 3, flexWrap: 'wrap', minWidth: 0, maxWidth: '100%' }, aba: { flex: 1, paddingVertical: 11, paddingHorizontal: 5, borderRadius: 10, alignItems: 'center' }, abaAtiva: { backgroundColor: '#ffffff' }, abaTexto: { fontSize: 14, fontWeight: '600', color: '#e0f7fa', minWidth: 0, textAlign: 'center', flexShrink: 1, flexWrap: 'wrap', includeFontPadding: true, maxWidth: '100%', lineHeight: 20, width: '100%' }, abaTextoAtivo: { color: '#0097b2', flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%' }, conteudo: { padding: 20, flexGrow: 1 },
  vazio: { backgroundColor: '#ffffff', borderRadius: 18, padding: 32, alignItems: 'center', gap: 8 }, vazioTitulo: { fontSize: 16, fontWeight: 'bold', color: '#333333', marginTop: 6, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 23 }, vazioTexto: { fontSize: 13.5, color: '#777777', textAlign: 'center', lineHeight: 20, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%' },
  cardSalvo: { backgroundColor: '#0097b2', borderRadius: 15, padding: 18, borderLeftWidth: 5, borderLeftColor: '#0097b2', gap: 6 }, topoCardSalvo: { flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap', minWidth: 0, maxWidth: '100%' }, cidadeSalva: { width: '100%', minWidth: 0, lineHeight: 23, fontSize: 16, fontWeight: 'bold', color: '#ffffff', flexShrink: 1, flexWrap: 'wrap', includeFontPadding: true, maxWidth: '100%' }, horarioSalvo: { flexShrink: 1, maxWidth: '100%', lineHeight: 19, fontSize: 12.5, fontWeight: 'bold', color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true }, resumoSalvo: { width: '100%', fontSize: 14, color: '#e0f7fa', lineHeight: 20, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%' }, rodapeSalvo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, flexWrap: 'wrap', minWidth: 0, maxWidth: '100%', gap: 10 }, progressoSalvo: { color: '#ffffff', fontWeight: '700', fontSize: 12, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 17, flex: 1 },
  carregandoTela: { ...StyleSheet.absoluteFill, backgroundColor: '#f4f9fa', zIndex: 100, elevation: 20 }, carregandoCentro: { alignItems: 'center', justifyContent: 'center', padding: 32, paddingBottom: 110, gap: 18, flexGrow: 1 }, carregandoIcone: { width: 104, height: 104, borderRadius: 35, backgroundColor: '#e0f3f6', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }, carregandoTitulo: { width: '100%', fontSize: 27, fontWeight: '800', color: '#194650', textAlign: 'center', flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 38 }, carregandoTexto: { fontSize: 15, lineHeight: 24, color: '#617d86', textAlign: 'center', maxWidth: '100%', flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, width: '100%' }, carregandoLegenda: { width: '100%', fontSize: 12, color: '#8b9da3', flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 17 }, navCarregando: { position: 'absolute', bottom: 0, right: 0, left: 0 },
});
