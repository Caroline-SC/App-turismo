import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Navbar from './Navbar';

const LARGURA_CARD = Dimensions.get('window').width - 40;
const TOTAL_PAGINAS = 3; // Quantidade de slides no carrossel

export default function Home({ aoSair, aoMudarAba }) {
  const [paginaAtiva, setPaginaAtiva] = useState(0);
  const scrollRef = useRef(null);

  // Carrossel automático
  useEffect(() => {
    const intervalo = setInterval(() => {
      const proximaPagina = (paginaAtiva + 1) % TOTAL_PAGINAS;

      scrollRef.current?.scrollTo({
        x: proximaPagina * LARGURA_CARD,
        animated: true,
      });

      setPaginaAtiva(proximaPagina);
    }, 5000);

    return () => clearInterval(intervalo);
  }, [paginaAtiva]);

  const regiaoSalvador = {
    latitude: -12.9714,
    longitude: -38.5014,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const pontosTuristicos = [
    { id: '1', titulo: 'Farol da Barra', lat: -13.0104, lng: -38.5329, cor: 'red' },
    { id: '2', titulo: 'Ponto Histórico 1', lat: -12.9718, lng: -38.5112, cor: 'red' },
    { id: '3', titulo: 'Seu Local Atual', lat: -12.9810, lng: -38.5220, cor: 'black' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />

      {/* Topo com saudação */}
      <View style={styles.topoHome}>
        <View>
          <Text style={styles.boasVindas}>Olá, usuário</Text>
          <Text style={styles.subtitulo}>Você está em Salvador!</Text>
        </View>
      </View>

      {/* Mapa */}
      <View style={styles.containerMapa}>
        <MapView style={styles.mapa} initialRegion={regiaoSalvador} loadingEnabled={true}>
          {pontosTuristicos.map((ponto) => (
            <Marker
              key={ponto.id}
              coordinate={{ latitude: ponto.lat, longitude: ponto.lng }}
              title={ponto.titulo}
              pinColor={ponto.cor}
            />
          ))}
        </MapView>
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
          <TouchableOpacity style={styles.cardLink} onPress={() => alert('Farol da Barra')}>
            <View style={styles.infoCard}>
              <Text style={styles.tituloCard}>Farol da Barra ➔</Text>
              <Text style={styles.descricaoCard}>Conheça o monumento histórico e o Museu Náutico.</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cardLink} onPress={() => alert('Pelourinho')}>
            <View style={styles.infoCard}>
              <Text style={styles.tituloCard}>Pelourinho ➔</Text>
              <Text style={styles.descricaoCard}>Explore o centro histórico cheio de cores e cultura.</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cardLink} onPress={() => alert('Elevador Lacerda')}>
            <View style={styles.infoCard}>
              <Text style={styles.tituloCard}>Elevador Lacerda ➔</Text>
              <Text style={styles.descricaoCard}>Aproveite a vista incrível conectando as cidades.</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* Pontinhos indicadores */}
        <View style={styles.containerBolinhas}>
          {[0, 1, 2].map((index) => (
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