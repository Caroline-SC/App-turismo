import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Navbar from './Navbar';

export default function PlaceDetail({ local, aoVoltar, aoMudarAba }) {
  const [opcao, setOpcao] = useState('resumo');
  const [favoritado, setFavoritado] = useState(false);

  const favoritar = () => {
  if (!favoritado) {
    alert('Item favoritado');
  }
  setFavoritado(!favoritado);
}; // 'resumo' ou 'historia'

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />

      {/* Topo */}
      <View style={styles.topo}>
        <TouchableOpacity style={styles.voltar} onPress={aoVoltar}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.titulo}>{local.nome}</Text>
        <Text style={styles.subtitulo}>
          {local.bairro} · {local.distancia}
        </Text>
      </View>

      {/* Duas opções */}
      <View style={styles.seletor}>
        <TouchableOpacity
          style={[styles.opcao, opcao === 'resumo' && styles.opcaoAtiva]}
          onPress={() => setOpcao('resumo')}
        >
          <Text style={[styles.textoOpcao, opcao === 'resumo' && styles.textoOpcaoAtiva]}>
            Resumo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.opcao, opcao === 'historia' && styles.opcaoAtiva]}
          onPress={() => setOpcao('historia')}
        >
          <Text style={[styles.textoOpcao, opcao === 'historia' && styles.textoOpcaoAtiva]}>
            História completa
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
        {opcao === 'resumo' ? (
  <Resumo local={local} favoritado={favoritado} aoFavoritar={favoritar} />
) : (
  <Historia local={local} />
)}
      </ScrollView>

      <Navbar abaAtiva="explore" aoMudarAba={aoMudarAba} />
    </View>
  );
}

function Resumo({ local, favoritado, aoFavoritar }) {
  return (
    <View style={{ gap: 18 }}>
      <View style={styles.etiquetas}>
        <View style={styles.etiqueta}>
          <Text style={styles.textoEtiqueta}>{local.categoria}</Text>
        </View>
        <View style={[styles.etiqueta, local.gratuito ? styles.etiquetaVerde : styles.etiquetaCinza]}>
          <Text style={[styles.textoEtiqueta, local.gratuito && { color: '#2e7d32' }]}>
            {local.gratuito ? 'Gratuito' : 'Pago'}
          </Text>
        </View>

        <TouchableOpacity style={styles.botaoCoracao} onPress={aoFavoritar} activeOpacity={0.7}>
          <Ionicons
            name={favoritado ? 'heart' : 'heart-outline'}
            size={22}
            color={favoritado ? '#e53935' : '#666666'}
          />
        </TouchableOpacity>
      </View>

      <Bloco titulo="Resumo da história">
        <Text style={styles.texto}>{local.resumo}</Text>
      </Bloco>

      <Bloco titulo="Como chegar">
        <Text style={styles.texto}>{local.comoChegar}</Text>
      </Bloco>

      <Bloco titulo="Entrada">
        <Text style={styles.texto}>{local.precoInfo}</Text>
      </Bloco>

      <Bloco titulo="Dicas">
        {local.dicas.map((dica, i) => (
          <Text key={i} style={styles.texto}>
            • {dica}
          </Text>
        ))}
      </Bloco>
    </View>
  );
}

function Historia({ local }) {
  return (
    <View>
      {local.historia.map((item, i) => {
        const ultimo = i === local.historia.length - 1;
        return (
          <View key={i} style={styles.linhaTempo}>
            {/* Bolinha + linha vertical */}
            <View style={styles.coluna}>
              <View style={styles.ponto} />
              {!ultimo && <View style={styles.linha} />}
            </View>

            <View style={styles.conteudoItem}>
              <Text style={styles.ano}>{item.ano}</Text>
              <Text style={styles.tituloItem}>{item.titulo}</Text>
              <Text style={styles.texto}>{item.texto}</Text>

              {item.curiosidade && (
                <View style={styles.curiosidade}>
                  <Text style={styles.rotuloCuriosidade}>Curiosidade</Text>
                  <Text style={styles.texto}>{item.curiosidade}</Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function Bloco({ titulo, children }) {
  return (
    <View style={styles.bloco}>
      <Text style={styles.tituloBloco}>{titulo}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', width: '100%' },
  topo: {
    backgroundColor: '#0097b2',
    paddingHorizontal: 25,
    paddingTop: 55,
    paddingBottom: 22,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  voltar: { marginBottom: 10, alignSelf: 'flex-start' },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#ffffff' },
  subtitulo: { fontSize: 14, color: '#e0f7fa', marginTop: 2 },

  seletor: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    margin: 20,
    marginBottom: 0,
    padding: 4,
  },
  opcao: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  opcaoAtiva: { backgroundColor: '#0097b2' },
  textoOpcao: { fontSize: 14, fontWeight: '600', color: '#666666' ,
    minWidth:130,
    textAlign: 'center',
  },
  textoOpcaoAtiva: { color: '#ffffff' },

  conteudo: { padding: 20, paddingBottom: 100 },

  etiquetas: { flexDirection: 'row', gap: 8 },
  etiqueta: {
    backgroundColor: '#e0f7fa',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  etiquetaVerde: { backgroundColor: '#e8f5e9' },
  etiquetaCinza: { backgroundColor: '#eeeeee' },
  textoEtiqueta: { fontSize: 12, fontWeight: '700', color: '#0097b2' ,
    minWidth:70,
    textAlign: 'center',
  },

  bloco: {
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    padding: 16,
    gap: 6,
  },
  tituloBloco: { fontSize: 16, fontWeight: 'bold', color: '#333333', marginBottom: 2 },
  texto: { fontSize: 14, color: '#666666', lineHeight: 21 },

  linhaTempo: { flexDirection: 'row' },
  coluna: { width: 24, alignItems: 'center' },
  ponto: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#0097b2',
    marginTop: 4,
  },
  linha: { flex: 1, width: 2, backgroundColor: '#b2ebf2', marginVertical: 2 },
  conteudoItem: { flex: 1, paddingLeft: 12, paddingBottom: 26, gap: 3 },
  ano: { fontSize: 13, fontWeight: 'bold', color: '#0097b2' },
  tituloItem: { fontSize: 17, fontWeight: 'bold', color: '#333333' },
  curiosidade: {
    backgroundColor: '#e0f7fa',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    gap: 2,
  },
  rotuloCuriosidade: { fontSize: 12, fontWeight: 'bold', color: '#0097b2' },
});