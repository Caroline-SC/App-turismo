import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, ImageBackground, StyleSheet, Text, TouchableOpacity, View, StatusBar, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import TourMap from './TourMap';
import Navbar from './Navbar';
import { useApp } from '../context/AppContext';
import { useNearbyLocation } from '../hooks/useNearbyLocation';
import { usePointPhoto } from '../hooks/usePointPhoto';
import { useRefreshCatalog } from '../hooks/useRefreshCatalog';
import { coordenadaValida, formatarDistancia, ordenarPorProximidade } from '../services/nearby';
import { larguraRotulo } from '../services/labels';

const AZUL = '#0097b2';
const REGIAO_SALVADOR = { latitude: -12.9714, longitude: -38.5014, latitudeDelta: 0.0922, longitudeDelta: 0.0421 };

function CardDestinoBase({ local, largura, altura, aoAbrir }) {
  const { fontScale } = useWindowDimensions();
  const foto = usePointPhoto(local.imagemUrl);
  const distancia = formatarDistancia(local.distanciaKm);
  return <TouchableOpacity activeOpacity={0.9} onPress={() => aoAbrir(local)} accessibilityRole="button"
    accessibilityLabel={'Conhecer ' + local.nome + ', ' + local.bairro} style={[styles.card, { width: largura, height: altura }]}>
    <ImageBackground key={foto.key} source={foto.source} resizeMode="cover" style={styles.fotoCard} onError={foto.aoErro}>
      {!foto.uri && <View style={styles.semFoto}><Ionicons name="image-outline" size={32} color="#85c8d1" />{foto.falhou ? <TouchableOpacity onPress={e => { e.stopPropagation(); foto.tentar(); }}><Text style={styles.semFotoTexto}>Tentar carregar foto</Text></TouchableOpacity> : <Text style={styles.semFotoTexto}>Foto não cadastrada</Text>}</View>}
      <View pointerEvents="none" style={styles.sombraFoto} />
      <View style={styles.cardTopo}>
        <View style={styles.etiqueta}><Ionicons name="compass-outline" size={12} color="#ffffff" /><Text style={[styles.etiquetaTexto, { minWidth: larguraRotulo('DESCUBRA', 8, fontScale, 65) }]}>DESCUBRA</Text></View>
        {distancia && <View style={styles.distancia} accessibilityLabel={'Distância aproximada em linha reta: ' + distancia}><Ionicons name="navigate-outline" size={12} color="#ffffff" /><Text style={[styles.distanciaTexto, { minWidth: larguraRotulo(distancia, 10, fontScale, 52) }]}>{distancia}</Text></View>}
      </View>
      <View style={styles.cardRodape}>
        <View style={styles.textosCard}><Text numberOfLines={2} style={styles.nomeCard}>{local.nome}</Text>
          <View style={styles.linhaBairro}><Ionicons name="location-outline" size={13} color="#e2f4f6" /><Text numberOfLines={1} style={styles.bairroCard}>{local.bairro}</Text></View>
        </View>
        <View style={styles.setaCard}><Ionicons name="arrow-forward" size={20} color="#ffffff" /></View>
      </View>
    </ImageBackground>
  </TouchableOpacity>;
}
const CardDestino = memo(CardDestinoBase);

export default function Home({ aoMudarAba, aoAbrirLocal }) {
  const { user, pontos, carregandoPontos, erroPontos, carregarPontos } = useApp();
  useRefreshCatalog();
  const localizacao = useNearbyLocation();
  const insets = useSafeAreaInsets();
  const { width, height, fontScale } = useWindowDimensions();
  const largura = Math.min(width - 64, 360), passo = largura + 12;
  const alturaPainel = Math.min(370, Math.max(295, height * 0.43));
  const alturaCard = Math.max(148, alturaPainel - 148);
  const alturaNav = 70 + insets.bottom;
  const [pagina, setPagina] = useState(0), [centralizar, setCentralizar] = useState(0);
  const listaRef = useRef(null), indiceRef = useRef(0), interagindo = useRef(false);
  const ordenados = useMemo(() => ordenarPorProximidade(pontos, localizacao.coords), [pontos, localizacao.coords]);
  const destaques = useMemo(() => ordenados.slice(0, 12), [ordenados]);
  const pontosMapa = useMemo(() => pontos.filter(coordenadaValida), [pontos]);
  const regiao = useMemo(() => localizacao.coords ? { ...localizacao.coords, latitudeDelta: 0.035, longitudeDelta: 0.025 } : REGIAO_SALVADOR, [localizacao.coords]);
  const paddingMapa = useMemo(() => ({ top: insets.top + 95, bottom: 30, left: 20, right: 20 }), [insets.top]);
  const perto = localizacao.coords && destaques[0]?.distanciaKm < 80;
  const status = localizacao.status === 'concedida' ? 'Distâncias aproximadas em linha reta.' : localizacao.mensagem;
  useEffect(() => {
    if (destaques.length < 2) return;
    const timer = setInterval(() => {
      if (interagindo.current) return;
      const proxima = (indiceRef.current + 1) % destaques.length;
      listaRef.current?.scrollToOffset({ offset: proxima * passo, animated: true });
      indiceRef.current = proxima; setPagina(proxima);
    }, 6000);
    return () => clearInterval(timer);
  }, [destaques.length, passo]);
  const irParaLocalizacao = () => {
    if (localizacao.coords) setCentralizar(atual => atual + 1);
    localizacao.atualizar();
  };
  return <View style={styles.container}>
    <StatusBar hidden={false} barStyle="dark-content" />
    <View style={[styles.areaMapa, { bottom: alturaNav + alturaPainel - 26 }]}>
      <TourMap style={StyleSheet.absoluteFill} regiao={regiao} pontos={pontosMapa} aoAbrirLocal={aoAbrirLocal}
        localizacaoPermitida={Boolean(localizacao.coords)} centralizar={centralizar} paddingMapa={paddingMapa} />
    </View>
    <View style={[styles.saudacao, { top: insets.top + 14 }]}>
      <View style={styles.marca}><Ionicons name="compass" size={27} color={AZUL} /></View>
      <View style={styles.saudacaoTexto}><Text style={styles.marcaTexto}>CITOUR · SALVADOR</Text><Text numberOfLines={1} style={styles.ola}>Olá, {user?.name?.split(' ')[0] || 'usuário'}<Text style={styles.pontoAzul}>.</Text></Text></View>
      <TouchableOpacity onPress={carregarPontos} disabled={carregandoPontos} style={styles.saudacaoDetalhe} accessibilityLabel="Atualizar pontos e fotos">{carregandoPontos ? <ActivityIndicator color={AZUL} /> : <Ionicons name="refresh-outline" size={22} color={AZUL} />}</TouchableOpacity>
    </View>
    <TouchableOpacity onPress={irParaLocalizacao} disabled={localizacao.status === 'obtendo'}
      accessibilityRole="button" accessibilityLabel={localizacao.coords ? 'Centralizar mapa na minha localização' : 'Permitir acesso à localização'}
      style={[styles.botaoLocalizacao, { bottom: alturaNav + alturaPainel + 16 }]}>
      {localizacao.status === 'obtendo' ? <ActivityIndicator size="small" color={AZUL} /> : <Ionicons name="locate" size={25} color={AZUL} />}
    </TouchableOpacity>
    <View style={[styles.painel, { bottom: alturaNav, height: alturaPainel }]}>
      <View style={styles.alca} />
      <View style={styles.cabecalhoPainel}>
        <View style={styles.titulosPainel}><Text style={styles.sobretitulo}>SEU PRÓXIMO PASSEIO</Text><Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={styles.tituloPainel}>{perto ? 'Perto de você' : 'Explore Salvador'}</Text></View>
        <TouchableOpacity onPress={() => aoMudarAba('explore')} style={styles.verTodos} accessibilityRole="button"><Text style={[styles.verTodosTexto, { minWidth: larguraRotulo('Ver todos', 12, fontScale, 65) }]}>Ver todos</Text><Ionicons name="arrow-forward" size={15} color={AZUL} /></TouchableOpacity>
      </View>
      <View style={styles.statusLocalizacao}><Ionicons name={localizacao.coords ? 'navigate-outline' : 'location-outline'} size={13} color={AZUL} /><Text numberOfLines={2} style={styles.statusTexto}>{status}</Text></View>
      {destaques.length ? <FlatList ref={listaRef} data={destaques} horizontal keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false} snapToInterval={passo} decelerationRate="fast" disableIntervalMomentum
        contentContainerStyle={styles.listaCards} style={{ height: alturaCard, flexGrow: 0, flexShrink: 0 }}
        ItemSeparatorComponent={Separador} renderItem={({ item }) => <CardDestino local={item} largura={largura} altura={alturaCard} aoAbrir={aoAbrirLocal} />}
        initialNumToRender={2} maxToRenderPerBatch={2} windowSize={3}
        getItemLayout={(_, index) => ({ length: passo, offset: passo * index, index })}
        onScrollBeginDrag={() => { interagindo.current = true; }}
        onScrollEndDrag={() => { interagindo.current = false; }}
        onMomentumScrollEnd={evento => { const i = Math.min(destaques.length - 1, Math.max(0, Math.round(evento.nativeEvent.contentOffset.x / passo))); indiceRef.current = i; setPagina(i); interagindo.current = false; }}
      /> : <TouchableOpacity style={[styles.estadoVazio, { height: alturaCard }]} onPress={carregarPontos} disabled={carregandoPontos}>
        {carregandoPontos ? <ActivityIndicator color={AZUL} /> : <Ionicons name="compass-outline" size={28} color={AZUL} />}
        <Text style={styles.vazioTexto}>{carregandoPontos ? 'Buscando seus próximos destinos…' : erroPontos ? 'Não foi possível carregar. Toque para tentar de novo.' : 'Nenhum ponto disponível no momento.'}</Text>
      </TouchableOpacity>}
      <View style={styles.rodapePainel}><View style={styles.tracoAzul} /><Text style={styles.rodapeTexto}>Salvador tem uma história em cada esquina</Text><Text style={[styles.contagem, { minWidth: larguraRotulo('00 / 00', 10, fontScale, 58) }]}>{destaques.length ? String(Math.min(pagina + 1, destaques.length)).padStart(2, '0') + ' / ' + String(destaques.length).padStart(2, '0') : '—'}</Text></View>
    </View>
    <Navbar abaAtiva="home" aoMudarAba={aoMudarAba} />
  </View>;
}
function Separador() { return <View style={{ width: 12 }} />; }

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f9f9' },
  areaMapa: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: '#f8faf9' },
  saudacao: { position: 'absolute', left: 20, right: 20, flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 23, backgroundColor: '#ffffff', shadowColor: '#173e46', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.09, shadowRadius: 15, elevation: 5 },
  marca: { width: 47, height: 47, borderRadius: 16, backgroundColor: '#e8f6f8', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  saudacaoTexto: { flex: 1 }, marcaTexto: { color: '#6d858b', fontSize: 10, fontWeight: '700', letterSpacing: 1.6, marginBottom: 4 },
  ola: { fontSize: 23, fontWeight: '700', color: '#143940', letterSpacing: -0.6 }, pontoAzul: { color: AZUL },
  saudacaoDetalhe: { marginLeft: 10 },
  botaoLocalizacao: { position: 'absolute', right: 20, width: 50, height: 50, borderRadius: 18, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', shadowColor: '#174b55', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.13, shadowRadius: 10, elevation: 5 },
  painel: { position: 'absolute', left: 0, right: 0, backgroundColor: '#edf6f7', borderTopLeftRadius: 30, borderTopRightRadius: 30, shadowColor: '#21464b', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 10 },
  alca: { alignSelf: 'center', width: 36, height: 4, borderRadius: 4, backgroundColor: '#b6ced1', marginTop: 11, marginBottom: 14 },
  cabecalhoPainel: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22 },
  titulosPainel: { flex: 1 }, sobretitulo: { fontSize: 9, letterSpacing: 1.7, fontWeight: '800', color: AZUL, marginBottom: 4 },
  tituloPainel: { color: '#143940', fontSize: 24, fontWeight: '800', letterSpacing: -0.7 },
  verTodos: { flexDirection: 'row', flexShrink: 0, alignItems: 'center', gap: 5, paddingVertical: 10, paddingLeft: 12 }, verTodosTexto: { fontSize: 12, fontWeight: '700', color: AZUL, flexShrink: 0, lineHeight: 18 },
  statusLocalizacao: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 22, marginTop: 6, marginBottom: 15, minHeight: 19 },
  statusTexto: { flex: 1, color: '#657e83', fontSize: 11, lineHeight: 15 },
  listaCards: { paddingHorizontal: 20 },
  card: { borderRadius: 20, overflow: 'hidden', backgroundColor: '#185765' }, fotoCard: { flex: 1 },
  semFoto: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', paddingBottom: 30 }, semFotoTexto: { fontSize: 10, color: '#b8dfe4', marginTop: 5 },
  sombraFoto: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(4, 28, 36, 0.32)' },
  cardTopo: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between', alignItems: 'center', padding: 13 },
  etiqueta: { flexDirection: 'row', gap: 5, alignItems: 'center', backgroundColor: AZUL, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 },
  etiquetaTexto: { color: '#ffffff', fontSize: 8, letterSpacing: 1.1, fontWeight: '800', flexShrink: 0, lineHeight: 13 },
  distancia: { flexDirection: 'row', gap: 4, alignItems: 'center', backgroundColor: 'rgba(7, 34, 43, 0.55)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 }, distanciaTexto: { color: '#ffffff', fontSize: 10, fontWeight: '600', flexShrink: 0, lineHeight: 15 },
  cardRodape: { marginTop: 'auto', padding: 15, paddingTop: 12, backgroundColor: 'rgba(5, 29, 38, 0.38)', flexDirection: 'row', gap: 10, alignItems: 'flex-end' },
  textosCard: { flex: 1 }, nomeCard: { color: '#ffffff', fontSize: 21, lineHeight: 24, fontWeight: '800', letterSpacing: -0.4 },
  linhaBairro: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 }, bairroCard: { flex: 1, color: '#e2f4f6', fontSize: 11 },
  setaCard: { width: 32, height: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: AZUL },
  estadoVazio: { marginHorizontal: 20, borderRadius: 20, backgroundColor: '#e1eff1', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, gap: 12 }, vazioTexto: { color: '#4a6d75', textAlign: 'center', fontSize: 13, lineHeight: 19 },
  rodapePainel: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingHorizontal: 22 }, tracoAzul: { width: 12, height: 3, borderRadius: 3, backgroundColor: AZUL },
  rodapeTexto: { flex: 1, color: '#789095', fontSize: 9 }, contagem: { color: AZUL, fontSize: 10, fontWeight: '700', letterSpacing: 0.7, flexShrink: 0, textAlign: 'right', lineHeight: 16 },
});
