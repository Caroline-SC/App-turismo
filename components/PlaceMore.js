import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Image, Linking, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAnimationValue } from '../hooks/useAnimationValue';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNearbyLocation } from '../hooks/useNearbyLocation';
import { usePointPhoto } from '../hooks/usePointPhoto';
import { coordenadaValida, creditoFoto } from '../services/nearby';
import { avisar } from '../services/notify';
import Navbar from './Navbar';

const TourMap = lazy(() => import('./TourMap'));
const AZUL = '#0097b2';
const NATIVO = Platform.OS !== 'web';

export default function PlaceMore({ local, foto, reduzido, carregando, erro, aoTentar, aoVoltar, aoMudarAba, favoritado, aoFavoritar, salvando }) {
  const insets = useSafeAreaInsets();
  const [pagina, setPagina] = useState('menu');
  const imagem = usePointPhoto(foto, 960);
  const credito = creditoFoto(foto);
  const entrada = useAnimationValue(0);
  useEffect(() => {
    entrada.setValue(reduzido ? 1 : 0);
    if (reduzido) return;
    const animacao = Animated.timing(entrada, { toValue: 1, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: NATIVO });
    animacao.start(); return () => animacao.stop();
  }, [pagina, reduzido, entrada]);
  const navegar = aba => { aoVoltar(); aoMudarAba(aba); };
  return <Modal visible animationType={reduzido ? 'none' : 'fade'} onRequestClose={aoVoltar} statusBarTranslucent>
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.corpo, { bottom: 70 + insets.bottom }]}>
        {pagina !== 'mapa' && <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {imagem.uri && <Image key={imagem.key} source={imagem.source} resizeMode="cover" blurRadius={pagina === 'historia' ? 18 : 4} style={styles.foto} onError={imagem.aoErro} />}
          <View style={styles.escurecer} /><View style={styles.gradiente} />
        </View>}
        <View style={[styles.cabecalho, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity style={styles.voltar} onPress={aoVoltar} accessibilityRole="button" accessibilityLabel="Voltar para Explorar">
            <Ionicons name="arrow-back" size={22} color="#ffffff" /><Text style={styles.voltarTexto}>Explorar</Text>
          </TouchableOpacity>
          <Text style={styles.paginaLegenda}>{pagina === 'historia' ? 'HISTÓRIA' : pagina === 'mapa' ? 'COMO CHEGAR' : 'SAIBA MAIS'}</Text>
          {pagina === 'menu' ? <TouchableOpacity style={styles.iconeBotao} onPress={aoFavoritar} disabled={salvando} accessibilityRole="button" accessibilityLabel={favoritado ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}><Ionicons name={favoritado ? 'heart' : 'heart-outline'} size={23} color="#74dbe9" /></TouchableOpacity> : <TouchableOpacity style={styles.iconeBotao} onPress={() => setPagina('menu')} accessibilityRole="button" accessibilityLabel="Ver opções do lugar"><Ionicons name="grid-outline" size={21} color="#74dbe9" /></TouchableOpacity>}
        </View>
        <Animated.View style={[styles.conteudo, { opacity: entrada, transform: [{ translateY: entrada.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }]}>
          {pagina === 'menu' ? <ScrollView contentContainerStyle={styles.menu} showsVerticalScrollIndicator={false}>
            <Text style={styles.sobretitulo}>CADA LUGAR, UMA DESCOBERTA</Text>
            <Text accessibilityRole="header" style={styles.nome}>{local.nome}</Text>
            <Text style={styles.bairro}>{local.bairro} · Salvador</Text>
            {credito && <TouchableOpacity onPress={() => Linking.openURL(credito.pagina).catch(erro => avisar('Créditos da foto', erro.message))} accessibilityRole="link"><Text style={styles.creditoFoto}>Foto: {credito.autor} · {credito.licenca}</Text></TouchableOpacity>}
            <Text style={styles.menuResumo}>Escolha como quer conhecer este lugar.</Text>
            <TouchableOpacity style={styles.opcao} onPress={() => setPagina('historia')} accessibilityRole="button">
              <View style={styles.opcaoIcone}><Ionicons name="book-outline" size={27} color="#75dfed" /></View>
              <View style={styles.opcaoTextos}><Text style={styles.opcaoTitulo}>História</Text><Text style={styles.opcaoResumo}>Uma viagem pelas histórias deste lugar, capítulo por capítulo.</Text></View><Ionicons name="arrow-forward" size={22} color="#75dfed" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.opcao} onPress={() => setPagina('mapa')} accessibilityRole="button">
              <View style={styles.opcaoIcone}><Ionicons name="navigate-outline" size={27} color="#75dfed" /></View>
              <View style={styles.opcaoTextos}><Text style={styles.opcaoTitulo}>Como chegar</Text><Text style={styles.opcaoResumo}>Encontre o ponto no mapa e prepare sua visita.</Text></View><Ionicons name="arrow-forward" size={22} color="#75dfed" />
            </TouchableOpacity>
          </ScrollView> : pagina === 'historia' ? <Historia key={local.id} local={local} reduzido={reduzido} carregando={carregando} erro={erro} aoTentar={aoTentar} aoVoltar={aoVoltar} /> : <ComoChegar local={local} />}
        </Animated.View>
      </View>
      <Navbar abaAtiva="explore" aoMudarAba={navegar} />
    </View>
  </Modal>;
}

function Historia({ local, reduzido, carregando, erro, aoTentar, aoVoltar }) {
  const scroll = useAnimationValue(0);
  const [altura, setAltura] = useState(500);
  const historia = local.historia || [];
  return <Animated.ScrollView onLayout={e => setAltura(e.nativeEvent.layout.height)} contentContainerStyle={styles.historia} showsVerticalScrollIndicator={false} scrollEventThrottle={16}
    onScroll={reduzido ? undefined : Animated.event([{ nativeEvent: { contentOffset: { y: scroll } } }], { useNativeDriver: NATIVO })}>
    <Text style={styles.sobretitulo}>AS MARCAS DO TEMPO</Text><Text accessibilityRole="header" style={styles.nome}>{local.nome}</Text>
    <Text style={styles.introducao}>Deslize para acompanhar esta história.</Text>
    {carregando ? <View style={styles.estado}><ActivityIndicator color="#75dfed" /><Text style={styles.texto}>Carregando a história completa…</Text></View> : erro ? <View style={styles.estado}><Text style={styles.texto}>{erro}</Text><TouchableOpacity onPress={aoTentar} style={styles.botao}><Text style={styles.botaoTexto}>Tentar novamente</Text></TouchableOpacity></View> : historia.length ? historia.map((item, indice) => <Capitulo key={item.ano + '-' + indice} item={item} indice={indice} ultimo={indice === historia.length - 1} scroll={scroll} altura={altura} reduzido={reduzido} />) : <View style={styles.estado}><Ionicons name="book-outline" size={32} color="#75dfed" /><Text style={styles.texto}>A história completa ainda não foi cadastrada para este lugar.</Text></View>}
    <TouchableOpacity onPress={aoVoltar} style={[styles.botao, styles.fimHistoria]} accessibilityRole="button"><Ionicons name="arrow-back" size={19} color="#ffffff" /><Text style={styles.botaoTexto}>Voltar para Explorar</Text></TouchableOpacity>
  </Animated.ScrollView>;
}

function Capitulo({ item, indice, ultimo, scroll, altura, reduzido }) {
  const [medida, setMedida] = useState(null);
  // A posição medida permanece fixa; só a escala visual acompanha a leitura.
  const centro = medida ? medida.y + medida.height / 2 - altura / 2 : 0;
  const alcance = Math.max(180, altura * 0.65);
  const escala = reduzido || !medida ? 1 : scroll.interpolate({ inputRange: [centro - alcance, centro, centro + alcance], outputRange: [1, 1.035, 1], extrapolate: 'clamp' });
  const direita = indice % 2 !== 0;
  return <View onLayout={e => { const { y, height } = e.nativeEvent.layout; setMedida(atual => atual?.y === y && atual?.height === height ? atual : { y, height }); }} style={[styles.capituloPosicao, { alignSelf: direita ? 'flex-end' : 'flex-start' }]}>
    <Animated.View style={[styles.capitulo, { transform: [{ scale: escala }] }]}>
      <View style={styles.capituloTopo}><View style={styles.data}><Text style={styles.dataTexto}>{item.ano || 'História'}</Text></View><Text style={styles.numero}>{String(indice + 1).padStart(2, '0')}</Text></View>
      {Boolean(item.titulo) && <Text style={styles.capituloTitulo}>{item.titulo}</Text>}
      <Text style={styles.texto}>{item.texto}</Text>
      {Boolean(item.curiosidade) && <View style={styles.curiosidade}><Ionicons name="bulb-outline" size={18} color="#75dfed" /><Text style={styles.curiosidadeTexto}>{item.curiosidade}</Text></View>}
    </Animated.View>
    {!ultimo && <View style={[styles.conector, direita ? { left: 0 } : { right: 0 }, { transform: [{ rotate: direita ? '-32deg' : '32deg' }] }]} />}
  </View>;
}

function ComoChegar({ local }) {
  const gps = useNearbyLocation();
  const [centralizar, setCentralizar] = useState(0);
  const valido = coordenadaValida(local);
  const regiao = useMemo(() => ({ latitude: local.latitude, longitude: local.longitude, latitudeDelta: 0.012, longitudeDelta: 0.012 }), [local.latitude, local.longitude]);
  const abrirNavegacao = () => {
    if (!valido) return;
    const params = new URLSearchParams({ api: '1', destination: `${local.latitude},${local.longitude}` });
    if (coordenadaValida(gps.coords)) params.set('origin', `${gps.coords.latitude},${gps.coords.longitude}`);
    Linking.openURL('https://www.google.com/maps/dir/?' + params).catch(err => avisar('Como chegar', err.message));
  };
  return <View style={styles.mapaPagina}>
    <View style={styles.mapaTituloLinha}><View style={styles.mapaTituloTextos}><Text accessibilityRole="header" style={styles.mapaTitulo}>{local.nome}</Text><Text style={styles.mapaBairro}>{local.bairro} · Salvador</Text></View><Ionicons name="location" size={25} color={AZUL} /></View>
    <View style={styles.mapa}>
      {valido ? <Suspense fallback={<View style={styles.mapaEstado}><ActivityIndicator color={AZUL} /><Text style={styles.mapaAviso}>Abrindo o mapa…</Text></View>}><TourMap style={styles.mapaPreenchido} regiao={regiao} pontos={[local]} aoAbrirLocal={() => {}} localizacaoPermitida={gps.status === 'concedida'} centralizar={centralizar} paddingMapa={{ top: 15, left: 15, bottom: 15, right: 15 }} /></Suspense> : <View style={styles.mapaEstado}><Ionicons name="map-outline" size={40} color={AZUL} /><Text style={styles.mapaAviso}>A localização deste ponto ainda não foi cadastrada.</Text></View>}
      {valido && <TouchableOpacity onPress={() => setCentralizar(n => n + 1)} style={styles.centralizar} accessibilityRole="button" accessibilityLabel="Centralizar no ponto turístico"><Ionicons name="locate-outline" size={25} color={AZUL} /></TouchableOpacity>}
    </View>
    <ScrollView style={styles.visitaScroll} contentContainerStyle={styles.visita}>
      <Text style={styles.visitaTitulo}>Planeje sua visita</Text><Text style={styles.visitaTexto}>{local.precoInfo}</Text>
      {gps.status !== 'concedida' && <TouchableOpacity onPress={gps.atualizar} disabled={gps.status === 'obtendo'}><Text style={styles.localizacaoTexto}>{gps.status === 'obtendo' ? 'Buscando sua localização…' : 'Ativar minha localização'}</Text></TouchableOpacity>}
      {valido && <TouchableOpacity style={styles.botao} onPress={abrirNavegacao} accessibilityRole="button"><Ionicons name="navigate-outline" size={20} color="#ffffff" /><Text style={styles.botaoTexto}>Abrir navegação</Text><Ionicons name="open-outline" size={17} color="#ffffff" /></TouchableOpacity>}
      {valido && <Text style={styles.rotaLegenda}>Veja o trajeto e siga as orientações no Google Maps.</Text>}
    </ScrollView>
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#081e29' }, corpo: { position: 'absolute', top: 0, left: 0, right: 0 }, conteudo: { flex: 1 },
  foto: { position: 'absolute', top: -20, left: -20, width: '112%', height: '112%' }, escurecer: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(3, 17, 27, 0.62)' }, gradiente: { ...StyleSheet.absoluteFill, backgroundImage: 'linear-gradient(180deg, rgba(3,17,27,0.35) 0%, rgba(3,17,27,0.1) 45%, rgba(3,17,27,0.65) 100%)' },
  cabecalho: { paddingHorizontal: 18, paddingBottom: 15, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(4, 23, 33, 0.35)' }, voltar: { flexDirection: 'row', gap: 7, alignItems: 'center', minHeight: 44 }, voltarTexto: { color: '#ffffff', fontSize: 14, fontWeight: '600' }, paginaLegenda: { flex: 1, textAlign: 'center', color: '#93c6d0', fontSize: 9, fontWeight: '700', letterSpacing: 1.5 }, iconeBotao: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  menu: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 30 }, sobretitulo: { color: '#75dfed', fontSize: 9, fontWeight: '800', letterSpacing: 1.7, marginBottom: 12 }, nome: { color: '#ffffff', fontSize: 33, lineHeight: 39, fontWeight: '800', letterSpacing: -0.7 }, bairro: { color: '#c7e1e6', fontSize: 14, marginTop: 10 }, menuResumo: { color: '#d9e9ec', fontSize: 15, lineHeight: 24, marginTop: 24, marginBottom: 20 },
  opcao: { flexDirection: 'row', alignItems: 'center', gap: 15, backgroundColor: 'rgba(255,255,255,0.11)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', borderRadius: 22, padding: 18, marginBottom: 14 }, opcaoIcone: { width: 45, height: 52, justifyContent: 'center', alignItems: 'center' }, opcaoTextos: { flex: 1 }, opcaoTitulo: { color: '#ffffff', fontSize: 20, fontWeight: '700' }, opcaoResumo: { color: '#d3e3e7', fontSize: 13, lineHeight: 20, marginTop: 5 },
  historia: { padding: 23, paddingTop: 30, paddingBottom: 45 }, introducao: { color: '#d5e5e9', fontSize: 14, lineHeight: 22, marginTop: 12, marginBottom: 38 }, estado: { alignItems: 'center', gap: 18, paddingVertical: 35 },
  capituloPosicao: { width: '86%', maxWidth: 440, marginBottom: 42 }, capitulo: { padding: 20, backgroundColor: 'rgba(245,252,255,0.13)', borderWidth: 1, borderColor: 'rgba(223,244,250,0.32)', borderRadius: 23 }, capituloTopo: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'space-between', marginBottom: 17 }, data: { backgroundColor: 'rgba(0,151,178,0.45)', borderColor: 'rgba(117,223,237,0.55)', borderWidth: 1, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 13, flexShrink: 1 }, dataTexto: { color: '#b0f2fa', fontSize: 15, fontWeight: '800' }, numero: { color: 'rgba(224,245,250,0.45)', fontSize: 12, fontWeight: '600' }, capituloTitulo: { fontSize: 19, lineHeight: 26, color: '#ffffff', fontWeight: '700', marginBottom: 10 }, texto: { color: '#f2f8fa', fontSize: 15, lineHeight: 25 }, conector: { width: 45, height: 1, backgroundColor: 'rgba(117,223,237,0.4)', position: 'absolute', bottom: -22, marginHorizontal: 6 }, curiosidade: { borderTopWidth: 1, borderTopColor: 'rgba(220,244,248,0.2)', marginTop: 17, paddingTop: 15, flexDirection: 'row', gap: 8 }, curiosidadeTexto: { flex: 1, color: '#c1edf3', fontSize: 13, lineHeight: 22 },
  botao: { backgroundColor: AZUL, borderRadius: 26, paddingHorizontal: 20, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }, botaoTexto: { color: '#ffffff', fontSize: 15, fontWeight: '700' }, fimHistoria: { alignSelf: 'center', marginTop: 12 },
  creditoFoto: { color: '#b6dbe2', fontSize: 11, lineHeight: 18, marginTop: 10, textDecorationLine: 'underline' },
  mapaPagina: { flex: 1, backgroundColor: '#f4f9fa' }, mapaTituloLinha: { flexDirection: 'row', alignItems: 'center', padding: 21, gap: 12 }, mapaTituloTextos: { flex: 1 }, mapaTitulo: { color: '#143e49', fontSize: 23, fontWeight: '800' }, mapaBairro: { color: '#6a838a', fontSize: 13, marginTop: 6 }, mapa: { flex: 1, minHeight: 150, marginHorizontal: 18, borderRadius: 24, overflow: 'hidden', backgroundColor: '#e4eff2' }, mapaPreenchido: { width: '100%', height: '100%' }, mapaEstado: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, gap: 15 }, mapaAviso: { color: '#526e77', textAlign: 'center', lineHeight: 22 }, centralizar: { position: 'absolute', bottom: 15, right: 15, backgroundColor: '#ffffff', width: 47, height: 47, borderRadius: 24, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  visitaScroll: { flexGrow: 0, maxHeight: '42%' }, visita: { padding: 21, gap: 10 }, visitaTitulo: { fontSize: 17, fontWeight: '700', color: '#143e49' }, visitaTexto: { fontSize: 14, lineHeight: 21, color: '#526e77' }, localizacaoTexto: { fontSize: 13, lineHeight: 20, color: AZUL, paddingVertical: 4 }, rotaLegenda: { fontSize: 11, lineHeight: 17, textAlign: 'center', color: '#70868d' },
});
