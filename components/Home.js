import  { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import MapView, { Marker } from 'react-native-maps'; 
import { Ionicons } from '@expo/vector-icons';

const LARGURA_CARD = Dimensions.get('window').width - 40;
const TOTAL_PAGINAS = 3; // Quantidade de slides no seu carrossel

export default function Home({ aoSair }) {
  const [paginaAtiva, setPaginaAtiva] = useState(0);
  
  // Criamos uma referência para conseguir controlar o ScrollView via código
  const scrollRef = useRef(null);

  // Efeito que roda o temporizador do carrossel automático
  useEffect(() => {
    const intervalo = setInterval(() => {
      // Calcula qual será a próxima página
      const proximaPagina = (paginaAtiva + 1) % TOTAL_PAGINAS;
      
      // Move o carrossel suavemente para o próximo card
      scrollRef.current?.scrollTo({
        x: proximaPagina * LARGURA_CARD,
        animated: true,
      });

      setPaginaAtiva(proximaPagina);
    }, 5000); // 5 segundos por slide

    // Limpa o temporizador se o usuário sair da tela para não gastar memória
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
      {/* Topo com Saudação */}
      <View style={styles.topoHome}>
        <View>
          <Text style={styles.boasVindas}>Olá, usuário</Text>
          <Text style={styles.subtitulo}>Você está em Salvador!</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 15 }}>
          <TouchableOpacity onPress={() => alert('Mudar idioma')}>
            <Ionicons name="language-outline" size={26} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => alert('Abrir perfil do usuário')}>
            <Ionicons name="person-circle-outline" size={28} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Container do Mapa */}
      <View style={styles.containerMapa}>
        <MapView 
          style={styles.mapa}
          initialRegion={regiaoSalvador}
          loadingEnabled={true}
        >
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

      {/* Área de conteúdo rolável abaixo do mapa */}
      <ScrollView contentContainerStyle={styles.conteudoScroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.tituloSecao}>Explorar Destinos</Text>
        
        {/* Carrossel Horizontal de Destinos */}
        <ScrollView 
          ref={scrollRef} // Conecta a referência para o código conseguir rolar a tela
          horizontal 
          pagingEnabled 
          showsHorizontalScrollIndicator={false}
          snapToInterval={LARGURA_CARD}
          decelerationRate="fast"
          onScroll={(e) => {
            const ind = Math.round(e.nativeEvent.contentOffset.x / LARGURA_CARD);
            // Só atualiza o estado se o índice realmente mudar, evitando loops
            if (ind !== paginaAtiva) {
              setPaginaAtiva(ind);
            }
          }}
          scrollEventThrottle={16}
        >
          {/* Slide 1 */}
          <TouchableOpacity style={styles.cardLink} onPress={() => alert('Farol da Barra')}>
            <View style={styles.infoCard}>
              <Text style={styles.tituloCard}>Farol da Barra ➔</Text>
              <Text style={styles.descricaoCard}>Conheça o monumento histórico e o Museu Náutico.</Text>
            </View>
          </TouchableOpacity>

          {/* Slide 2 */}
          <TouchableOpacity style={styles.cardLink} onPress={() => alert('Pelourinho')}>
            <View style={styles.infoCard}>
              <Text style={styles.tituloCard}>Pelourinho ➔</Text>
              <Text style={styles.descricaoCard}>Explore o centro histórico cheio de cores e cultura.</Text>
            </View>
          </TouchableOpacity>

          {/* Slide 3 */}
          <TouchableOpacity style={styles.cardLink} onPress={() => alert('Elevador Lacerda')}>
            <View style={styles.infoCard}>
              <Text style={styles.tituloCard}>Elevador Lacerda ➔</Text>
              <Text style={styles.descricaoCard}>Aproveite a vista incrível conectando as cidades.</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* Três pontinhos indicadores de página */}
        <View style={styles.containerBolinhas}>
          {[0, 1, 2].map((index) => (
            <View 
              key={index} 
              style={[
                styles.bolinha, 
                paginaAtiva === index ? styles.bolinhaAtiva : styles.bolinhaInativa
              ]} 
            />
          ))}
        </View>
      </ScrollView>
       <View style={styles.navbar}>
        <TouchableOpacity style={styles.botaoNavbar} onPress={() => alert('Ir para Home')}>
          <Ionicons name="home" size={24} color="#0097b2" />
          <Text style={[styles.textoNavbar, styles.textoAtivo]}>Início</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botaoNavbar} onPress={() => alert('Ir para Buscar / Explorar')}>
          <Ionicons name="search-outline" size={24} color="#666666" />
          <Text style={styles.textoNavbar}>Explorar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botaoNavbar} onPress={() => alert('Ir para Favoritos')}>
          <Ionicons name="heart-outline" size={24} color="#666666" />
          <Text style={styles.textoNavbar}>Favoritos</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    width: '100%'
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
    paddingBottom: 30,
  },
  containerMapa: {
    width: '100%',
    height: 290,
    overflow: 'hidden',
    marginTop: 0,
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
    height: 150
  },
  tituloCard: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0097b2',
    marginBottom: 5,
    textAlign: 'center'
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
   navbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    // Sombra para dar o efeito de aba sobreposta
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  botaoNavbar: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  textoNavbar: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  textoAtivo: {
    color: '#0097b2', // Cor azul do seu tema para a aba selecionada
    fontWeight: 'bold',
  },
});
