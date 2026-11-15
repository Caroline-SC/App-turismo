import { useState, useEffect, useRef, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import TourMap from './TourMap';
import Navbar from './Navbar';
import { useApp } from '../context/AppContext';

const LARGURA_CARD = Dimensions.get('window').width - 40;
const REGIAO_SALVADOR = { latitude: -12.9714, longitude: -38.5014, latitudeDelta: 0.0922, longitudeDelta: 0.0421 };

export default function Home({ aoMudarAba, aoAbrirLocal }) {
  const { user, pontos, carregandoPontos, erroPontos, carregarPontos } = useApp();
  const destaques = pontos.slice(0, 3);
  const [paginaAtiva, setPaginaAtiva] = useState(0);
  const scrollRef = useRef(null);

  // Carrossel automático
  useEffect(() => {
    const intervalo = setInterval(() => {
      const proximaPagina = (paginaAtiva + 1) % Math.max(1, destaques.length);

      scrollRef.current?.scrollTo({
        x: proximaPagina * LARGURA_CARD,
        animated: true,
      });

      setPaginaAtiva(proximaPagina);
    }, 5000);

    return () => clearInterval(intervalo);
  }, [paginaAtiva, destaques.length]);

  const pontosTuristicos = useMemo(() => pontos.filter(p => Number.isFinite(p.latitude) && Number.isFinite(p.longitude)), [pontos]);

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />

      {/* Topo com saudação */}
      <View style={styles.topoHome}>
        <View>
          <Text style={styles.boasVindas}>Olá, {user?.name || 'usuário'}</Text>
          <Text style={styles.subtitulo}>Você está em Salvador!</Text>
        </View>
      </View>

      {/* Mapa */}
      <View style={styles.containerMapa}>
        <TourMap style={styles.mapa} regiao={REGIAO_SALVADOR} pontos={pontosTuristicos} aoAbrirLocal={aoAbrirLocal} />
      </View>

      {/* Conteúdo rolável abaixo do mapa */}
      <ScrollView contentContainerStyle={styles.conteudoScroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.tituloSecao}>Explorar Destinos</Text>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={LARGURA_CARD}
          decelerationRate="fast"
          onScroll={(e) => {
            const ind = Math.round(e.nativeEvent.contentOffset.x / LARGURA_CARD);
            if (ind !== paginaAtiva) {
              setPaginaAtiva(ind);
            }
          }}
          scrollEventThrottle={16}
        >
          {destaques.map(local => <TouchableOpacity key={local.id} style={styles.cardLink} onPress={() => aoAbrirLocal(local)}>
            <View style={styles.infoCard}>
              <Text style={styles.tituloCard}>{local.nome} ➔</Text>
              <Text style={styles.descricaoCard}>{local.descricaoCurta}</Text>
            </View>
          </TouchableOpacity>)}
          {!destaques.length && <TouchableOpacity style={styles.cardLink} onPress={carregarPontos}><View style={styles.infoCard}><Text style={styles.descricaoCard}>{carregandoPontos ? 'Carregando destinos…' : erroPontos || 'Nenhum destino disponível.'}</Text></View></TouchableOpacity>}
        </ScrollView>

        {/* Pontinhos indicadores */}
        <View style={styles.containerBolinhas}>
          {destaques.map((_, index) => (
            <View
              key={index}
              style={[styles.bolinha, paginaAtiva === index ? styles.bolinhaAtiva : styles.bolinhaInativa]}
            />
          ))}
        </View>
      </ScrollView>

      <Navbar abaAtiva="home" aoMudarAba={aoMudarAba} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    width: '100%',
  },
  topoHome: {
    backgroundColor: '#0097b2',
    paddingHorizontal: 25,
    paddingTop: 60,
    paddingBottom: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  boasVindas: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitulo: {
    fontSize: 14,
    color: '#e0f7fa',
    marginTop: 2,
    
  },
  conteudoScroll: {
    paddingHorizontal: 20,
    paddingBottom: 100, // espaço para a navbar
  },
  containerMapa: {
    width: '100%',
    height: 290,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  mapa: {
    width: '100%',
    height: '100%',
  },
  tituloSecao: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 50,
    marginBottom: 15,
    textAlign: 'center',
  },
  cardLink: {
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    padding: 20,
    borderLeftWidth: 5,
    borderLeftColor: '#0097b2',
    width: LARGURA_CARD,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoCard: {
    flexDirection: 'column',
    height: 150,
  },
  tituloCard: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0097b2',
    marginBottom: 5,
    textAlign: 'center',
  },
  descricaoCard: {
    fontSize: 14,
    color: '#666666',
  },
  containerBolinhas: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  bolinha: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  bolinhaAtiva: {
    width: 18,
    backgroundColor: '#0097b2',
  },
  bolinhaInativa: {
    width: 8,
    backgroundColor: '#cccccc',
  },
});
