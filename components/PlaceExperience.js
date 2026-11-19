import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Animated, AppState, Easing, FlatList, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import Text from './AppText';
import { useAnimationValue } from '../hooks/useAnimationValue';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '../context/AppContext';
import { usePlaceDetails } from '../hooks/usePlaceDetails';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { pesquisarPontos, pontoInicial, categoriaVisual } from '../services/explore';
import { usePointPhoto } from '../hooks/usePointPhoto';
import { useRefreshCatalog } from '../hooks/useRefreshCatalog';
import { avisar } from '../services/notify';
import { useNavbarHeight } from '../hooks/useNavbarHeight';
import Navbar from './Navbar';
import PlaceMore from './PlaceMore';

const AZUL = '#0097b2';
const DRIVER_NATIVO = Platform.OS !== 'web';

export default function PlaceExperience({ localInicial = null, pontoId = null, aoVoltar = null, aoSelecionar = null, aoMudarAba }) {
  const { pontos, user, carregandoPontos, erroPontos, carregarPontos, alternarFavorito } = useApp();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const reduzido = useReducedMotion();
  const [selecionado, setSelecionado] = useState(null);
  const [busca, setBusca] = useState('');
  const [pesquisando, setPesquisando] = useState(false);
  const [dicaAberta, setDicaAberta] = useState(false);
  const [indiceDica, setIndiceDica] = useState(0);
  const [historiaAberta, setHistoriaAberta] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const sugestao = pontoInicial(pontos);
  const id = selecionado || pontoId || localInicial?.id || sugestao?.id;
  const base = pontos.find(p => p.id === id) || (localInicial?.id === id ? localInicial : null);
  const detalhes = usePlaceDetails(id, base);
  const local = detalhes.ponto;
  const foto = usePointPhoto(local?.imagemUrl, 960);
  useRefreshCatalog();
  const fotoDisponivel = Boolean(foto.uri);
  const resultados = pesquisarPontos(pontos, busca);
  const dicas = local?.dicas || [];
  const dica = dicas[indiceDica % Math.max(1, dicas.length)] || (detalhes.carregando ? 'Buscando as dicas deste lugar…' : 'Ainda não há dicas cadastradas para este lugar.');
  const categorias = local?.categorias || [];
  const alturaNav = useNavbarHeight();
  const fade = useAnimationValue(0);
  const imagemFade = useAnimationValue(0);
  const zoom = useAnimationValue(1);
  const dicaAnim = useAnimationValue(0);

  useFocusEffect(useCallback(() => {
    if (!id || reduzido === null || historiaAberta) return;
    fade.setValue(reduzido ? 1 : 0);
    imagemFade.setValue(reduzido ? 1 : 0);
    zoom.setValue(1);
    if (reduzido) return;
    const entrada = Animated.timing(fade, { toValue: 1, duration: 650, delay: 100, easing: Easing.out(Easing.cubic), useNativeDriver: DRIVER_NATIVO });
    const fotoEntrada = Animated.timing(imagemFade, { toValue: 1, duration: 650, useNativeDriver: DRIVER_NATIVO });
    const movimento = Animated.loop(Animated.sequence([
      Animated.timing(zoom, { toValue: 1.045, duration: 14000, easing: Easing.inOut(Easing.sin), useNativeDriver: DRIVER_NATIVO, isInteraction: false }),
      Animated.timing(zoom, { toValue: 1, duration: 14000, easing: Easing.inOut(Easing.sin), useNativeDriver: DRIVER_NATIVO, isInteraction: false }),
    ]));
    entrada.start(); fotoEntrada.start(); movimento.start();
    const assinatura = AppState.addEventListener('change', estado => { if (estado === 'active') movimento.start(); else movimento.stop(); });
    return () => { entrada.stop(); fotoEntrada.stop(); movimento.stop(); assinatura.remove(); };
  }, [id, reduzido, historiaAberta, fade, imagemFade, zoom]));

  useEffect(() => {
    const animacao = Animated.timing(dicaAnim, { toValue: dicaAberta ? 1 : 0, duration: reduzido ? 0 : dicaAberta ? 260 : 180, easing: Easing.out(Easing.cubic), useNativeDriver: DRIVER_NATIVO });
    animacao.start(); return () => animacao.stop();
  }, [dicaAberta, reduzido, dicaAnim]);

  const escolher = ponto => {
    setSelecionado(ponto.id); setBusca(''); setPesquisando(false); setDicaAberta(false); setIndiceDica(0); setHistoriaAberta(false);
    Keyboard.dismiss(); aoSelecionar?.(ponto);
  };
  const favoritar = async () => {
    if (salvando || !id) return;
    setSalvando(true);
    try { await alternarFavorito(id); } catch (err) { avisar('Favoritos', err.message); } finally { setSalvando(false); }
  };
  const fecharBusca = () => { setPesquisando(false); Keyboard.dismiss(); };

  return <View style={styles.container}>
    <StatusBar hidden={false} barStyle="light-content" />
    <View style={[styles.cenario, { bottom: alturaNav }]}>
      {fotoDisponivel ? <Animated.Image key={foto.key} source={foto.source} resizeMode="cover" style={[styles.imagem, { opacity: imagemFade, transform: [{ scale: zoom }] }]}
        onError={foto.aoErro} onLoad={() => { Animated.timing(imagemFade, { toValue: 1, duration: reduzido ? 0 : 600, useNativeDriver: DRIVER_NATIVO }).start(); }} /> : <View style={styles.reservaFoto}><Ionicons name="compass-outline" size={84} color="#3a7685" /><Text style={styles.textoReserva}>{local ? 'Foto indisponível' : 'Descubra Salvador'}</Text>{foto.falhou && <TouchableOpacity onPress={foto.tentar}><Text style={styles.textoReserva}>Tentar carregar foto</Text></TouchableOpacity>}</View>}
      <View pointerEvents="none" style={styles.escurecer} />
      <View pointerEvents="none" style={styles.gradiente} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.conteudoScroll, { minHeight: Math.max(0, height - alturaNav), paddingTop: insets.top + 170 }]}
        onScrollBeginDrag={fecharBusca} keyboardShouldPersistTaps="handled">
        <View style={styles.espacoFoto} />
        {local ? <Animated.View style={{ opacity: fade, transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
          <Text style={styles.sobretitulo}>DESCUBRA SALVADOR</Text>
          <Text accessibilityRole="header" style={styles.nome}>{local.nome}</Text>
          <View style={styles.bairroLinha}><Ionicons name="location" size={16} color="#ffffff" /><Text style={styles.bairro}>{local.bairro || 'Salvador'} · Salvador</Text></View>
          <Text style={styles.resumo}>{local.resumo || local.historiaResumida || 'Conheça este ponto turístico de Salvador.'}</Text>
          {foto.falhou && <TouchableOpacity onPress={foto.tentar} style={styles.avisoErro}><Text style={styles.avisoErroTexto}>Tentar carregar a foto novamente</Text></TouchableOpacity>}
          {detalhes.erro ? <TouchableOpacity onPress={detalhes.tentarNovamente} style={styles.avisoErro}><Text style={styles.avisoErroTexto}>Não foi possível atualizar os detalhes. Toque para tentar novamente.</Text></TouchableOpacity> : null}
          <View style={styles.acoesLocal}><TouchableOpacity style={styles.saibaMais} onPress={() => { fecharBusca(); setHistoriaAberta(true); }} accessibilityRole="button" accessibilityLabel={'Saiba mais sobre ' + local.nome}>
            <Text style={styles.saibaMaisTexto}>Saiba mais</Text><Ionicons name="arrow-forward" size={22} color="#ffffff" />
          </TouchableOpacity><TouchableOpacity onPress={favoritar} disabled={salvando} style={styles.favoritoBotao} accessibilityRole="button" accessibilityLabel={(user?.favoritos?.includes(id) ? 'Remover ' : 'Adicionar ') + local.nome + (user?.favoritos?.includes(id) ? ' dos favoritos' : ' aos favoritos')} accessibilityState={{ selected: Boolean(user?.favoritos?.includes(id)), busy: salvando }}>
            {salvando ? <ActivityIndicator color="#ffffff" /> : <Ionicons name={user?.favoritos?.includes(id) ? 'heart' : 'heart-outline'} size={25} color="#ffffff" />}
          </TouchableOpacity></View>
          <View style={styles.tipos}>
            {(categorias.length ? categorias : ['Ponto turístico']).map((cat, indice) => {
              const tipo = categoriaVisual(cat);
              return <View key={cat + indice} style={styles.tipo}><Ionicons name={tipo.icone} size={23} color={AZUL} /><Text style={styles.tipoTexto}>{tipo.titulo}</Text></View>;
            })}
          </View>
        </Animated.View> : <View style={styles.vazio}>
          {carregandoPontos || detalhes.carregando ? <ActivityIndicator color={AZUL} size="large" /> : <Ionicons name="compass-outline" size={40} color={AZUL} />}
          <Text style={styles.nomeVazio}>{carregandoPontos || detalhes.carregando ? 'Buscando lugares…' : 'Vamos explorar Salvador?'}</Text>
          <Text style={styles.resumo}>{erroPontos || detalhes.erro || 'Os pontos turísticos aparecerão aqui assim que estiverem disponíveis.'}</Text>
          {!carregandoPontos && <TouchableOpacity style={styles.saibaMais} onPress={id ? detalhes.tentarNovamente : carregarPontos}><Text style={styles.saibaMaisTexto}>Tentar novamente</Text></TouchableOpacity>}
        </View>}
      </ScrollView>
    </View>

    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} pointerEvents="box-none" style={[styles.buscaCamada, { top: insets.top + 12, bottom: alturaNav }]}>
      <View style={styles.barraBusca}>
        {aoVoltar ? <TouchableOpacity onPress={aoVoltar} style={styles.iconeBusca} accessibilityLabel="Voltar"><Ionicons name="arrow-back" size={22} color="#344a50" /></TouchableOpacity> : <Ionicons name="search-outline" size={22} color="#344a50" />}
        <TextInput value={busca} onChangeText={setBusca} onFocus={() => setPesquisando(true)} placeholder="Pesquisar pontos turísticos" placeholderTextColor="#6c777c"
          style={styles.inputBusca} accessibilityLabel="Pesquisar pontos turísticos" autoCorrect={false} returnKeyType="search"
          onSubmitEditing={() => { if (resultados[0]) escolher(resultados[0]); }} />
        <TouchableOpacity style={styles.iconeBusca} onPress={() => { if (pesquisando) { setBusca(''); fecharBusca(); } else setPesquisando(true); }} accessibilityLabel={pesquisando ? 'Fechar pesquisa' : 'Mostrar pontos turísticos'}>
          <Ionicons name={pesquisando ? 'close' : 'options-outline'} size={22} color="#344a50" />
        </TouchableOpacity>
      </View>
      {pesquisando && <View style={styles.resultados}>
        <Text style={styles.resultadosTitulo}>{busca.trim() ? 'RESULTADOS' : 'PONTOS TURÍSTICOS'}</Text>
        <FlatList data={resultados} keyExtractor={p => p.id} keyboardShouldPersistTaps="handled" initialNumToRender={7} style={styles.listaResultados}
          ListEmptyComponent={<Text style={styles.semResultados}>{carregandoPontos ? 'Carregando pontos…' : 'Nenhum ponto encontrado. Busque pelo nome ou bairro.'}</Text>}
          renderItem={({ item }) => <TouchableOpacity onPress={() => escolher(item)} style={styles.resultado} accessibilityRole="button">
            <View style={styles.resultadoIcone}><Ionicons name="location-outline" size={20} color={AZUL} /></View><View style={styles.resultadoTextos}><Text style={styles.resultadoNome}>{item.nome}</Text><Text style={styles.resultadoBairro}>{item.bairro}</Text></View><Ionicons name="chevron-forward" size={16} color={AZUL} />
          </TouchableOpacity>} />
      </View>}
    </KeyboardAvoidingView>

    {!pesquisando && local && <View pointerEvents="box-none" style={[styles.dicasLinha, { top: insets.top + 82 }]}>
      <Animated.View pointerEvents={dicaAberta ? 'auto' : 'none'} accessibilityElementsHidden={!dicaAberta} importantForAccessibility={dicaAberta ? 'auto' : 'no-hide-descendants'}
        style={[styles.dicaCard, { opacity: dicaAnim, transform: [{ translateX: dicaAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }]}>
        <ScrollView style={styles.dicaScroll}><Text style={styles.dicaTexto}>Dica: {dica}</Text></ScrollView>
        {dicas.length > 1 && <TouchableOpacity onPress={() => setIndiceDica(i => i + 1)} style={styles.proximaDica} accessibilityLabel="Mostrar próxima dica"><Text style={styles.proximaDicaTexto}>Próxima dica</Text><Ionicons name="arrow-forward" size={13} color="#74dbe9" /></TouchableOpacity>}
      </Animated.View>
      <TouchableOpacity onPress={() => setDicaAberta(a => !a)} style={[styles.lampada, dicaAberta && styles.lampadaAtiva]} accessibilityRole="button" accessibilityLabel={dicaAberta ? 'Ocultar dica' : 'Mostrar dica'} accessibilityState={{ expanded: dicaAberta }}>
        <Ionicons name={dicaAberta ? 'bulb' : 'bulb-outline'} size={25} color="#ffffff" />
      </TouchableOpacity>
    </View>}

    {historiaAberta && local && <PlaceMore local={local} foto={local.imagemUrl} reduzido={reduzido !== false}
      carregando={detalhes.carregando} erro={detalhes.erro} aoTentar={detalhes.tentarNovamente}
      aoVoltar={() => setHistoriaAberta(false)} aoMudarAba={aoMudarAba} favoritado={Boolean(user?.favoritos?.includes(id))} aoFavoritar={favoritar} salvando={salvando} />}
    <Navbar abaAtiva="explore" aoMudarAba={aoMudarAba} />
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#071c24' },
  cenario: { position: 'absolute', top: 0, right: 0, left: 0, overflow: 'hidden' },
  imagem: { position: 'absolute', top: -8, bottom: -8, right: -8, left: -8, width: '105%', height: '105%' },
  reservaFoto: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', backgroundColor: '#143c48' }, textoReserva: { color: '#94bdc7', marginTop: 14, fontSize: 13, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 19 },
  escurecer: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(5, 20, 30, 0.26)' },
  gradiente: { ...StyleSheet.absoluteFill, backgroundImage: 'linear-gradient(180deg, rgba(4, 16, 25, 0.15) 0%, rgba(4, 16, 25, 0.05) 30%, rgba(3, 14, 20, 0.66) 62%, rgba(3, 14, 20, 0.97) 100%)' },
  conteudoScroll: { paddingHorizontal: 23, paddingBottom: 22, flexGrow: 1 }, espacoFoto: { flex: 1, minHeight: 55 },
  sobretitulo: { color: '#32c1d5', fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 8, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 14 },
  nome: { color: '#ffffff', fontSize: 37, lineHeight: 52, fontWeight: '800', letterSpacing: -1.1, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%' },
  bairroLinha: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap', minWidth: 0, maxWidth: '100%' }, bairro: { color: '#f3f8fa', fontSize: 14, flex: 1, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 20 },
  resumo: { color: '#eef4f5', fontSize: 15, lineHeight: 23, marginTop: 19, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%' },
  acoesLocal: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginTop: 20, minWidth: 0, maxWidth: '100%' }, favoritoBotao: { width: 51, height: 51, borderRadius: 26, borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)', backgroundColor: 'rgba(0,151,178,0.6)', alignItems: 'center', justifyContent: 'center' },
  saibaMais: { minWidth: 0, maxWidth: '100%', backgroundColor: AZUL, alignSelf: 'flex-start', borderRadius: 28, flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, flexWrap: 'wrap', width: '72%', minHeight: 54 }, saibaMaisTexto: { color: '#ffffff', fontSize: 17, fontWeight: '800', flexShrink: 1, lineHeight: 24, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', flex: 1, width: '75%' },
  tipos: { flexDirection: 'row', gap: 10, paddingTop: 22, flexWrap: 'wrap', minWidth: 0, maxWidth: '100%', width: '100%' }, tipo: { flexDirection: 'row', flexShrink: 0, alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 13, minWidth: 0, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.45)', backgroundColor: 'rgba(255,255,255,0.06)', flexWrap: 'wrap', maxWidth: '100%', width: '48%', minHeight: 50 }, tipoTexto: { color: '#ffffff', fontSize: 12, fontWeight: '600', flexShrink: 1, lineHeight: 19, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', flex: 1, width: '70%' },
  buscaCamada: { position: 'absolute', left: 18, right: 18, zIndex: 30 },
  barraBusca: { minHeight: 52, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 28, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, gap: 9, elevation: 4, flexWrap: 'wrap', minWidth: 0, maxWidth: '100%' },
  inputBusca: { flex: 1, fontSize: 14, color: '#253940', paddingVertical: 14, minWidth: 0, minHeight: 52 }, iconeBusca: { minWidth: 28, minHeight: 40, alignItems: 'center', justifyContent: 'center' },
  resultados: { borderRadius: 20, backgroundColor: '#ffffff', marginTop: 10, paddingTop: 15, paddingBottom: 6, elevation: 8, flexShrink: 1, maxHeight: '75%' },
  resultadosTitulo: { color: '#6e858b', fontSize: 10, fontWeight: '800', letterSpacing: 1.5, paddingHorizontal: 17, marginBottom: 6, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 14 }, listaResultados: { flexGrow: 0 },
  resultado: { flexDirection: 'row', alignItems: 'center', padding: 13, gap: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#edf2f3', flexWrap: 'wrap', minWidth: 0, maxWidth: '100%' }, resultadoIcone: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#ebf7f9', alignItems: 'center', justifyContent: 'center' }, resultadoTextos: { flex: 1, minWidth: 0 }, resultadoNome: { color: '#153840', fontSize: 14, fontWeight: '600', flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 20 }, resultadoBairro: { color: '#74888e', fontSize: 12, marginTop: 3, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 17 }, semResultados: { color: '#6a8187', fontSize: 14, lineHeight: 21, padding: 20, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%' },
  dicasLinha: { position: 'absolute', left: 23, right: 18, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-end', gap: 10, zIndex: 20, flexWrap: 'wrap', minWidth: 0, maxWidth: '100%' },
  dicaCard: { flex: 1, borderRadius: 16, borderWidth: 1.5, borderColor: AZUL, padding: 13, backgroundColor: 'rgba(9, 31, 43, 0.94)' }, dicaScroll: { maxHeight: 130 }, dicaTexto: { color: '#ffffff', fontSize: 13, lineHeight: 20, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%' }, proximaDica: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-end', paddingTop: 9, flexWrap: 'wrap', minWidth: 0, maxWidth: '100%' }, proximaDicaTexto: { color: '#74dbe9', fontSize: 11, fontWeight: '600', flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 16 }, lampada: { width: 48, height: 48, borderRadius: 24, backgroundColor: AZUL, alignItems: 'center', justifyContent: 'center', elevation: 3 }, lampadaAtiva: { borderWidth: 2, borderColor: '#67d2e1' },
  avisoErro: { paddingVertical: 10 }, avisoErroTexto: { color: '#c9edf2', fontSize: 12, lineHeight: 18, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%' }, vazio: { paddingVertical: 28 }, nomeVazio: { color: '#ffffff', fontSize: 25, marginTop: 20, fontWeight: '700', flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 35 },
});
