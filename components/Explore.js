import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, StatusBar } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Navbar from './Navbar';
import { useApp } from '../context/AppContext';
import { normalizar } from '../services/adapters';

export default function Explore({ aoMudarAba, aoAbrirLocal }) {
  const [busca, setBusca] = useState('');
  const { pontos: places, carregandoPontos, erroPontos, carregarPontos } = useApp();

  const termo = normalizar(busca);
  const resultados = places.filter(
    (p) => normalizar(p.nome).includes(termo) || normalizar(p.bairro).includes(termo)
  );

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />

      <View style={styles.topo}>
        <Text style={styles.titulo}>Explorar</Text>
        <Text style={styles.subtitulo}>Descubra a história de Salvador</Text>

        <View style={styles.busca}>
          <Ionicons name="search-outline" size={20} color="#999999" />
          <TextInput
            style={styles.campoBusca}
            placeholder="Buscar local ou bairro"
            placeholderTextColor="#999999"
            value={busca}
            onChangeText={setBusca}
          />
          {busca.length > 0 && (
            <TouchableOpacity onPress={() => setBusca('')}>
              <Ionicons name="close-circle" size={20} color="#999999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.tituloSecao}>{termo ? 'Resultados' : 'Perto de você'}</Text>

        {resultados.length === 0 && (
          <Text style={styles.vazio} onPress={erroPontos ? carregarPontos : undefined}>{carregandoPontos ? 'Carregando locais…' : erroPontos ? `${erroPontos} Toque para tentar novamente.` : 'Nenhum local encontrado.'}</Text>
        )}

        {resultados.map((local) => (
          <TouchableOpacity
            key={local.id}
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => aoAbrirLocal && aoAbrirLocal(local)}
          >
            <View style={styles.cardTopo}>
              <View style={{ flex: 1 }}>
                <Text style={styles.nomeLocal}>{local.nome}</Text>
                <Text style={styles.bairro}>
                  {local.bairro} · {local.distancia}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#0097b2" />
            </View>
            <Text style={styles.descricao}>{local.descricaoCurta}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Navbar abaAtiva="explore" aoMudarAba={aoMudarAba} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', width: '100%' },
  topo: {
    backgroundColor: '#0097b2',
    paddingHorizontal: 25,
    paddingTop: 60,
    paddingBottom: 25,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#ffffff' },
  subtitulo: { fontSize: 14, color: '#e0f7fa', marginTop: 2 },
  busca: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    marginTop: 18,
    gap: 8,
  },
  campoBusca: { flex: 1, fontSize: 15, color: '#333333' },
  lista: { padding: 20, paddingBottom: 100, gap: 14 },
  tituloSecao: { fontSize: 18, fontWeight: 'bold', color: '#333333' },
  vazio: { fontSize: 14, color: '#999999', textAlign: 'center', marginTop: 20 },
  card: {
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    padding: 18,
    borderLeftWidth: 5,
    borderLeftColor: '#0097b2',
  },
  cardTopo: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  nomeLocal: { fontSize: 18, fontWeight: 'bold', color: '#333333' },
  bairro: { fontSize: 13, color: '#0097b2', marginTop: 2 },
  descricao: { fontSize: 14, color: '#666666', lineHeight: 20 },
});
