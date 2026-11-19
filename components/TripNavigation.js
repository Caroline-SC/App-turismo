import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, ImageBackground, Linking, Platform, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import Text from './AppText';
import { useAnimationValue } from '../hooks/useAnimationValue';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '../context/AppContext';
import { useTrip } from '../hooks/useTrip';
import { useLiveLocation } from '../hooks/useLiveLocation';
import { usePointPhoto } from '../hooks/usePointPhoto';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useRouteLeg } from '../hooks/useRouteLeg';
import { chegadaConfirmada, dinheiro, enriquecerParada, fimDaVisita, posicaoNoTrajeto, progressoDoRoteiro } from '../services/trip';
import { coordenadaValida, distanciaKm, formatarDistancia } from '../services/nearby';
import { avisar, confirmar } from '../services/notify';
import { TripState } from './TripDetail';
import Navbar from './Navbar';
import { useNavbarHeight } from '../hooks/useNavbarHeight';

const RouteMap = lazy(() => import('./RouteMap'));
const NATIVO = Platform.OS !== 'web';
const AZUL = '#0097b2';
const hora = data => data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

export default function TripNavigation({ roteiroId, aoVoltar, aoAbrirLocal, aoMudarAba }) {
  const trip = useTrip(roteiroId);
  return trip.roteiro ? <Navegacao key={roteiroId} trip={trip} aoVoltar={aoVoltar} aoAbrirLocal={aoAbrirLocal} aoMudarAba={aoMudarAba} /> : <TripState carregando={trip.carregando} erro={trip.erro} tentar={trip.tentar} aoVoltar={aoVoltar} aoMudarAba={aoMudarAba} />;
}
function Navegacao({ trip, aoVoltar, aoAbrirLocal, aoMudarAba }) {
  const { roteiro, executar, salvando } = trip;
  const { pontos } = useApp();
  const insets = useSafeAreaInsets(), { height } = useWindowDimensions();
  const p = progressoDoRoteiro(roteiro), dia = roteiro.plano.dias[p.dia];
  const parada = useMemo(() => enriquecerParada(dia.paradas[p.parada], pontos), [dia, p.parada, pontos]);
  const pausado = p.status === 'pausado';
  const chegou = p.status === 'visitando' || (pausado && p.anterior === 'visitando');
  const andando = p.status === 'em_trajeto';
  const semRestaurante = parada.tipo === 'almoco' && !parada.localConfirmado;
  const gps = useLiveLocation(andando);
  const rota = useRouteLeg(roteiro._id, p.dia, p.parada, gps.coords, andando && !semRestaurante);
  const localNaRota = useMemo(() => posicaoNoTrajeto(rota.rota, gps.coords), [rota.rota, gps.coords]);
  const foto = usePointPhoto(parada.imagemUrl, 960), reduzido = useReducedMotion();
  const [seguindo, setSeguindo] = useState(true), [centralizar, setCentralizar] = useState(0);
  const [alturaPainel, setAlturaPainel] = useState(chegou ? 375 : 240), [ancora, setAncora] = useState(null);
  const [alturaCabecalho, setAlturaCabecalho] = useState(155);
  const [agora, setAgora] = useState(() => Date.now());
  const amostras = useRef({ chave: '', quantidade: 0, timestamp: 0 }), ultimaChegada = useRef(0), ultimoRecalculo = useRef(0);
  const entrada = useAnimationValue(1), linha = useAnimationValue(0), pulso = useAnimationValue(0);
  const chaveParada = `${p.dia}:${p.parada}`;
  const alturaNav = useNavbarHeight();
  const padding = useMemo(() => ({ top: insets.top + alturaCabecalho + 20, bottom: alturaPainel + 30, left: 30, right: 30 }), [insets.top, alturaCabecalho, alturaPainel]);
  const ancorar = useCallback(ponto => setAncora(atual => atual && Math.abs(atual.x - ponto.x) < 1 && Math.abs(atual.y - ponto.y) < 1 ? atual : ponto), []);
  const moverMapa = useCallback(() => setSeguindo(false), []);
  const fim = fimDaVisita(p.chegouEm, parada.duracaoMinutos);
  const restantesVisita = fim ? Math.max(0, Math.ceil((fim.getTime() - agora) / 60000)) : null;
  const distanciaReta = coordenadaValida(gps.coords) && coordenadaValida(parada) ? distanciaKm(gps.coords, parada) : null;
  const pontoFresco = gps.coords && agora - gps.coords.timestamp < 25000 && gps.status === 'concedida';
  const proxima = dia.paradas[p.parada + 1];
  const todosConcluidos = roteiro.plano.dias.every((d, di) => d.paradas.every((_, pi) => p.concluidas.includes(`${di}:${pi}`)));
  const topoCard = Math.max(0, height - alturaNav - alturaPainel + 16);
  const alturaLinha = ancora && ancora.y > insets.top + 130 && ancora.y < topoCard ? topoCard - ancora.y : 0;

  useFocusEffect(useCallback(() => { const timer = setInterval(() => setAgora(Date.now()), 10000); return () => clearInterval(timer); }, []));
  useFocusEffect(useCallback(() => {
    if (!chegou || reduzido === null) return;
    entrada.setValue(reduzido ? 1 : 0); linha.setValue(reduzido ? 1 : 0); pulso.setValue(0);
    if (reduzido) return;
    const fotoEntrada = Animated.timing(entrada, { toValue: 1, duration: 550, delay: 250, useNativeDriver: NATIVO });
    const conector = Animated.timing(linha, { toValue: 1, duration: 600, useNativeDriver: false });
    const circulo = Animated.loop(Animated.timing(pulso, { toValue: 1, duration: 1600, useNativeDriver: NATIVO, isInteraction: false }));
    fotoEntrada.start(); conector.start(); circulo.start();
    return () => { fotoEntrada.stop(); conector.stop(); circulo.stop(); };
  }, [chegou, reduzido, entrada, linha, pulso]));

  useEffect(() => {
    if (!andando) return;
    if (amostras.current.chave !== chaveParada) amostras.current = { chave: chaveParada, quantidade: 0, timestamp: 0 };
    if (!chegadaConfirmada(gps.coords, parada)) { amostras.current.quantidade = 0; return; }
    if (amostras.current.timestamp === gps.coords.timestamp) return;
    amostras.current.timestamp = gps.coords.timestamp; amostras.current.quantidade++;
    if (amostras.current.quantidade >= 2 && Date.now() - ultimaChegada.current > 30000 && !salvando) {
      ultimaChegada.current = Date.now();
      executar('chegar', { origem: { latitude: gps.coords.latitude, longitude: gps.coords.longitude } }).then(() => setSeguindo(true)).catch(() => {});
    }
  }, [gps.coords, parada, andando, chaveParada, salvando, executar]);
  useEffect(() => {
    if (andando && Number.isFinite(gps.coords?.accuracy) && gps.coords.accuracy <= 50 && localNaRota?.distanciaDaRota > 75 && Date.now() - ultimoRecalculo.current > 45000 && !rota.carregando) {
      ultimoRecalculo.current = Date.now(); rota.recalcular();
    }
  }, [andando, gps.coords, localNaRota, rota]);

  const acao = async (nome, dados = {}) => { try { const novo = await executar(nome, dados); if (novo) { setSeguindo(true); setCentralizar(n => n + 1); } } catch (err) { avisar('Roteiro', err.message); } };
  const confirmarChegada = async () => {
    if (!await confirmar('Confirmar chegada', semRestaurante ? 'Você já escolheu um restaurante e chegou ao local para almoçar?' : `Você já está em ${parada.nome}? A chegada será registrada como confirmação manual.`)) return;
    acao('chegar', { manual: true });
  };
  const abrirMapa = (restaurantes = false) => {
    let url;
    if (restaurantes) {
      const posicao = coordenadaValida(gps.coords) ? gps.coords : parada;
      url = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(`restaurantes perto de ${posicao.latitude},${posicao.longitude}`);
    } else {
      if (!coordenadaValida(parada)) return;
      const params = new URLSearchParams({ api: '1', destination: `${parada.latitude},${parada.longitude}`, travelmode: roteiro.plano.parametros.transporte === 'carro' ? 'driving' : 'walking' });
      if (pontoFresco) params.set('origin', `${gps.coords.latitude},${gps.coords.longitude}`);
      url = 'https://www.google.com/maps/dir/?' + params;
    }
    Linking.openURL(url).catch(err => avisar('Mapa', err.message));
  };
  const nomeParada = semRestaurante ? 'Pausa para almoço' : parada.nome;
  const tituloInstrucao = p.status === 'concluido' ? (todosConcluidos ? 'Roteiro concluído!' : `${dia.titulo} concluído!`) : pausado ? 'Roteiro pausado' : chegou ? 'Você chegou!' : semRestaurante ? 'Hora de escolher onde comer' : !pontoFresco ? 'Buscando sua localização' : rota.carregando ? 'Calculando trajeto…' : localNaRota?.instrucao || 'Prepare sua próxima visita';

  return <View style={styles.container}>
    <StatusBar barStyle="dark-content" />
    <View style={[styles.mapa, { bottom: alturaNav }]}><Suspense fallback={<View style={styles.mapaCarregando}><ActivityIndicator color={AZUL} /></View>}><RouteMap origem={gps.coords} destino={parada} rota={rota.rota} seguindo={seguindo} centralizar={centralizar} chegou={chegou} padding={padding} aoMoverMapa={moverMapa} aoAncorar={ancorar} /></Suspense></View>
    {chegou && alturaLinha > 0 && <View pointerEvents="none" style={StyleSheet.absoluteFill}><Animated.View style={[styles.linhaChegada, { left: ancora.x - 1, top: ancora.y, height: linha.interpolate({ inputRange: [0, 1], outputRange: [0, alturaLinha] }) }]} /><Animated.View style={[styles.pulso, { left: ancora.x - 14, top: ancora.y - 14, opacity: pulso.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }), transform: [{ scale: pulso.interpolate({ inputRange: [0, 1], outputRange: [1, 2.8] }) }] }]} /></View>}
    <ScrollView onLayout={e => { const h = e.nativeEvent.layout.height; setAlturaCabecalho(atual => Math.abs(atual - h) > 1 ? h : atual); }} showsVerticalScrollIndicator={false} style={[styles.cabecalho, { top: insets.top + 10, maxHeight: Math.max(100, (height - alturaNav - insets.top) * 0.42) }]}>
      <View style={styles.cabecalhoLinha}><TouchableOpacity onPress={aoVoltar} style={styles.botaoCirculo} accessibilityLabel="Voltar à linha do tempo"><Ionicons name="arrow-back" size={22} color="#264851" /></TouchableOpacity><Text  style={styles.dia}>{dia.titulo} · {roteiro.nome}</Text>{['em_trajeto', 'visitando', 'pausado'].includes(p.status) && <TouchableOpacity onPress={() => acao(pausado ? 'retomar' : 'pausar')} disabled={salvando} style={styles.botaoCirculo} accessibilityLabel={pausado ? 'Retomar roteiro' : 'Pausar roteiro'}><Ionicons name={pausado ? 'play-outline' : 'pause-outline'} size={21} color={AZUL} /></TouchableOpacity>}</View>
      <View style={[styles.instrucao, (chegou || pausado || p.status === 'concluido') && styles.instrucaoChegada]}><Ionicons name={chegou || p.status === 'concluido' ? 'checkmark-circle' : pausado ? 'pause-circle-outline' : semRestaurante ? 'restaurant-outline' : 'navigate-outline'} size={32} color={chegou || pausado || p.status === 'concluido' ? AZUL : '#ffffff'} /><View style={styles.instrucaoTextos}><Text style={[styles.instrucaoTitulo, (chegou || pausado || p.status === 'concluido') && styles.instrucaoTituloChegada]}>{tituloInstrucao}</Text><Text style={[styles.instrucaoSub, (chegou || pausado || p.status === 'concluido') && styles.instrucaoSubChegada]}>{!chegou && localNaRota && andando && pontoFresco ? `${Math.round(localNaRota.metrosAteManobra)} m${localNaRota.rua ? ' · ' + localNaRota.rua : ''}` : `${nomeParada} · Parada ${p.parada + 1} de ${dia.paradas.length}`}</Text></View></View>
    </ScrollView>
    <TouchableOpacity onPress={() => { setSeguindo(true); setCentralizar(n => n + 1); }} style={[styles.centralizar, { bottom: alturaNav + alturaPainel + 16 }]} accessibilityLabel="Centralizar o mapa"><Ionicons name="locate-outline" size={25} color={AZUL} /></TouchableOpacity>

    <View onLayout={e => { const h = e.nativeEvent.layout.height; setAlturaPainel(atual => Math.abs(atual - h) > 1 ? h : atual); }} style={[styles.painel, { bottom: alturaNav, maxHeight: Math.max(160, height - alturaNav - insets.top - alturaCabecalho - 50) }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.painelConteudo}>
        {p.status === 'concluido' ? <View style={styles.conclusao}><Ionicons name="checkmark-circle" size={48} color={AZUL} /><Text style={styles.nome}>{todosConcluidos ? 'Você concluiu seu roteiro!' : 'Seu passeio de hoje está completo!'}</Text><Text style={styles.texto}>As visitas ficaram salvas. Confira os outros dias ou explore novos lugares.</Text><TouchableOpacity style={styles.botaoPrincipal} onPress={aoVoltar}><Text style={styles.botaoPrincipalTexto}>Voltar ao roteiro</Text></TouchableOpacity></View> : chegou ? <Animated.View style={{ opacity: entrada, transform: [{ translateY: entrada.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}>
          <ImageBackground key={foto.key} source={foto.source} onError={foto.aoErro} resizeMode="cover" style={[styles.foto, { minHeight: Math.min(190, height * 0.22) }]} imageStyle={{ borderRadius: 18 }}>
            {!foto.uri && <View style={styles.fotoReserva}><Ionicons name={parada.tipo === 'almoco' ? 'restaurant-outline' : 'image-outline'} size={35} color="#9fd9e2" />{foto.falhou && <TouchableOpacity onPress={foto.tentar}><Text style={styles.fotoRetry}>Tentar carregar foto</Text></TouchableOpacity>}</View>}
            <View pointerEvents="none" style={styles.fotoSombra} /><View style={styles.fotoRodape}><View style={{ flex: 1 }}><Text style={styles.fotoNome}>{nomeParada}</Text><Text style={styles.fotoBairro}>{parada.bairro || (parada.tipo === 'almoco' ? 'Pausa para comer' : 'Salvador')}</Text></View>{parada.pontoId && <TouchableOpacity style={styles.saibaMais} onPress={() => aoAbrirLocal({ id: parada.pontoId })}><Text style={styles.saibaMaisTexto}>Saiba mais ↗</Text></TouchableOpacity>}</View>
          </ImageBackground>
          <View style={styles.tempoLinha}><Ionicons name="time-outline" size={23} color="#234853" /><View style={{ flex: 1 }}><Text style={styles.tempoTitulo}>Tempo sugerido: {parada.duracaoMinutos} min</Text><Text style={styles.texto}>{fim ? `Aproveite até ${hora(fim)}${restantesVisita ? ' · ' + restantesVisita + ' min restantes' : ' · Tempo sugerido concluído'}` : 'Aproveite sua visita no seu ritmo.'}</Text></View></View>
          {p.chegadaManual && <Text style={styles.legendaMenor}>Chegada confirmada por você.</Text>}
          {proxima && <Text style={styles.proxima}>Próximo: {proxima.tipo === 'almoco' && !proxima.localConfirmado ? 'Pausa para almoço' : proxima.nome}</Text>}
          <TouchableOpacity style={styles.botaoPrincipal} onPress={() => acao(pausado ? 'retomar' : 'proximo')} disabled={salvando}><Text style={styles.botaoPrincipalTexto}>{salvando ? 'Salvando…' : pausado ? 'Retomar roteiro' : proxima ? 'Ir para o próximo ponto' : 'Concluir este dia'}</Text><Ionicons name="arrow-forward" size={20} color="#ffffff" /></TouchableOpacity>
        </Animated.View> : <>
          <View style={styles.alca} /><Text style={styles.legenda}>PRÓXIMA PARADA</Text><Text style={styles.nome}>{nomeParada}</Text><Text style={styles.texto}>{parada.bairro || (semRestaurante ? 'Escolha um restaurante nesta região' : 'Salvador')} · {dinheiro(parada.custoGrupo)} para o grupo</Text>
          {localNaRota && pontoFresco && <View style={styles.estatisticas}><Text style={styles.estatistica}>~{Math.max(1, Math.ceil(localNaRota.segundosRestantes / 60))} min</Text><Text style={styles.estatistica}>{formatarDistancia(localNaRota.distanciaRestante / 1000)}</Text><Text style={styles.estatistica}>Chegada ~{hora(new Date(agora + localNaRota.segundosRestantes * 1000))}</Text></View>}
          {!localNaRota && distanciaReta != null && <Text style={styles.legendaMenor}>{formatarDistancia(distanciaReta)} em linha reta até a região da parada.</Text>}
          {(!pontoFresco || gps.erro) && andando && <TouchableOpacity onPress={gps.atualizar}><Text style={styles.aviso}>{gps.erro || 'Aguardando um sinal recente do GPS. Toque para tentar novamente.'}</Text></TouchableOpacity>}
          {rota.carregando && <ActivityIndicator color={AZUL} style={{ marginVertical: 8 }} />}
          {rota.erro && <TouchableOpacity onPress={rota.recalcular}><Text style={styles.aviso}>{rota.erro} Toque para tentar novamente.</Text></TouchableOpacity>}
          {localNaRota?.distanciaDaRota > 75 && andando && <Text style={styles.aviso}>Você está fora do trajeto. Recalculando o caminho…</Text>}
          {trip.erroAcao && <Text style={styles.aviso}>{trip.erroAcao}</Text>}
          {p.status === 'pronto' || pausado ? <TouchableOpacity style={styles.botaoPrincipal} onPress={() => acao(pausado ? 'retomar' : 'iniciar', { dia: p.dia })} disabled={salvando}><Text style={styles.botaoPrincipalTexto}>{pausado ? 'Retomar roteiro' : 'Iniciar roteiro'}</Text></TouchableOpacity> : <>
            {semRestaurante && <TouchableOpacity style={styles.botaoPrincipal} onPress={() => abrirMapa(true)}><Ionicons name="restaurant-outline" size={20} color="#ffffff" /><Text style={styles.botaoPrincipalTexto}>Escolher onde comer</Text></TouchableOpacity>}
            <View style={styles.acoes}><TouchableOpacity onPress={aoVoltar} style={styles.botaoSecundario}><Text style={styles.botaoSecundarioTexto}>Ver roteiro</Text></TouchableOpacity><TouchableOpacity onPress={confirmarChegada} disabled={salvando} style={styles.botaoSecundario}><Text style={styles.botaoSecundarioTexto}>{salvando ? 'Salvando…' : semRestaurante ? 'Estou no restaurante' : 'Já estou aqui'}</Text></TouchableOpacity></View>
            {!semRestaurante && <TouchableOpacity onPress={() => abrirMapa()}><Text style={styles.linkMapa}>Abrir no Google Maps ↗</Text></TouchableOpacity>}
          </>}
        </>}
        {rota.rota && <View style={styles.creditos}><TouchableOpacity onPress={() => Linking.openURL('https://routing.openstreetmap.de/about.html').catch(() => {})}><Text style={styles.creditoTexto}>Rotas: OSRM / FOSSGIS · © OpenStreetMap</Text></TouchableOpacity><TouchableOpacity onPress={() => Linking.openURL(`https://www.openstreetmap.org/fixthemap?lat=${parada.latitude}&lon=${parada.longitude}&zoom=17`).catch(() => {})}><Text style={styles.creditoTexto}>Corrigir mapa ↗</Text></TouchableOpacity></View>}
      </ScrollView>
    </View>
    <Navbar abaAtiva="itinerary" aoMudarAba={aoMudarAba} />
  </View>;
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f8f9' }, mapa: { position: 'absolute', top: 0, left: 0, right: 0 }, mapaCarregando: { flex: 1, justifyContent: 'center', alignItems: 'center' }, cabecalho: { position: 'absolute', left: 15, right: 15 }, cabecalhoLinha: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap', minWidth: 0, maxWidth: '100%' }, botaoCirculo: { width: 41, height: 41, borderRadius: 16, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center', elevation: 2 }, dia: { color: '#183d48', fontSize: 14, fontWeight: '800', flex: 1, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 20 }, instrucao: { backgroundColor: AZUL, borderRadius: 21, padding: 17, flexDirection: 'row', alignItems: 'center', gap: 14, elevation: 3, flexWrap: 'wrap', minWidth: 0, maxWidth: '100%' }, instrucaoChegada: { backgroundColor: '#c5edf2' }, instrucaoTextos: { flex: 1, minWidth: 0 }, instrucaoTitulo: { fontSize: 21, color: '#ffffff', fontWeight: '800', flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 30 }, instrucaoTituloChegada: { color: '#123f4c', flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%' }, instrucaoSub: { fontSize: 12, lineHeight: 18, color: '#e2f7fa', marginTop: 5, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%' }, instrucaoSubChegada: { color: '#315f6c', flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%' },
  painel: { position: 'absolute', left: 0, right: 0, backgroundColor: '#eef7f9', borderTopLeftRadius: 27, borderTopRightRadius: 27, elevation: 6, shadowColor: '#153d48', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: -2 } }, painelConteudo: { padding: 17, paddingBottom: 12 }, alca: { width: 36, height: 4, borderRadius: 3, backgroundColor: '#c4d5da', alignSelf: 'center', marginBottom: 15 }, legenda: { color: '#71868d', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 6, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 14 }, nome: { color: '#153a45', fontSize: 26, fontWeight: '800', marginBottom: 5, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 37 }, texto: { color: '#647e88', fontSize: 12, lineHeight: 19, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%' }, legendaMenor: { color: '#708d96', fontSize: 11, lineHeight: 18, marginTop: 5, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%' }, estatisticas: { flexDirection: 'row', justifyContent: 'space-between', padding: 13, backgroundColor: '#e2eff3', borderRadius: 15, marginVertical: 12, gap: 8, flexWrap: 'wrap', minWidth: 0, maxWidth: '100%' }, estatistica: { color: '#244c59', fontSize: 12, fontWeight: '700', flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 17 }, aviso: { color: '#886535', fontSize: 11, lineHeight: 18, paddingVertical: 7, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%' }, centralizar: { position: 'absolute', right: 20, width: 45, height: 45, borderRadius: 23, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center', elevation: 3 },
  acoes: { flexDirection: 'row', gap: 9, marginTop: 12, flexWrap: 'wrap', minWidth: 0, maxWidth: '100%' }, botaoSecundario: { flex: 1, borderRadius: 15, borderWidth: 1, borderColor: AZUL, paddingHorizontal: 10, paddingVertical: 11, alignItems: 'center', justifyContent: 'center' }, botaoSecundarioTexto: { color: AZUL, fontSize: 12, fontWeight: '700', textAlign: 'center', flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 17 }, linkMapa: { color: AZUL, textAlign: 'center', fontSize: 11, fontWeight: '600', paddingTop: 11, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 16 }, botaoPrincipal: { backgroundColor: AZUL, borderRadius: 17, padding: 15, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10, marginTop: 12, flexWrap: 'wrap', minWidth: 0, maxWidth: '100%' }, botaoPrincipalTexto: { color: '#ffffff', fontWeight: '800', fontSize: 14, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 20, flex: 1, width: '80%', textAlign: 'center' },
  foto: { width: '100%', borderRadius: 18, overflow: 'hidden', backgroundColor: '#195967', justifyContent: 'flex-end' }, fotoReserva: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', paddingBottom: 25 }, fotoRetry: { color: '#b2e7ef', fontSize: 12, marginTop: 7, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 17 }, fotoSombra: { ...StyleSheet.absoluteFill, backgroundImage: 'linear-gradient(180deg, transparent 25%, rgba(3,19,28,0.85) 100%)' }, fotoRodape: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: 13, flexWrap: 'wrap', minWidth: 0, maxWidth: '100%' }, fotoNome: { color: '#ffffff', fontSize: 23, fontWeight: '800', flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 33 }, fotoBairro: { color: '#e6f5f7', fontSize: 11, marginTop: 4, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 16 }, saibaMais: { borderWidth: 1, borderColor: '#ffffff', borderRadius: 15, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: 'rgba(0,0,0,0.15)', width: '34%', minHeight: 40 }, saibaMaisTexto: { color: '#ffffff', fontWeight: '700', fontSize: 11, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 16, width: '100%', textAlign: 'center' }, tempoLinha: { flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 13, flexWrap: 'wrap', minWidth: 0, maxWidth: '100%' }, tempoTitulo: { fontSize: 14, color: '#244955', fontWeight: '800', flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 20 }, proxima: { color: '#3e626f', fontSize: 12, lineHeight: 18, marginTop: 9, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%' }, linhaChegada: { position: 'absolute', width: 2, backgroundColor: AZUL }, pulso: { position: 'absolute', width: 28, height: 28, borderRadius: 14, backgroundColor: '#44bed1', borderWidth: 1, borderColor: AZUL }, conclusao: { alignItems: 'center', gap: 12, paddingVertical: 12 }, creditos: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 5, paddingTop: 10, minWidth: 0, maxWidth: '100%' }, creditoTexto: { color: '#75919a', fontSize: 8, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 12 },
});
