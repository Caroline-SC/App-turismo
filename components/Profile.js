import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Navbar from './Navbar';

const OPCOES = [
  'Histórico',
  'Cultura',
  'Praias',
  'Gastronomia',
  'Museus',
  'Religioso',
  'Boemia',
  'Natureza',
  'Compras',
  'Arquitetura',
];

export default function Profile({
  aoMudarAba,
  aoSair,
  nome = 'Usuário',
  email = 'email@exemplo.com',
  favoritos = [],
  visitados = [],
}) {
  const [aba, setAba] = useState('preferencias');
  const [escolhidas, setEscolhidas] = useState(['Histórico', 'Cultura']);

  const alternar = (item) => {
    setEscolhidas((atual) =>
      atual.includes(item) ? atual.filter((i) => i !== item) : [...atual, item]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />

      <View style={styles.topo}>
        <Text style={styles.titulo}>Meu Perfil</Text>
        <Text style={styles.subtitulo}>Gerencie suas preferências turísticas</Text>
      </View>

      <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
        {/* Card do usuário */}
        <View style={styles.cardUsuario}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color="#ffffff" />
          </View>
          <Text style={styles.nome}>{nome}</Text>
          <Text style={styles.email}>{email}</Text>

          <View style={styles.divisor} />

          <View style={styles.numeros}>
            <View style={styles.numero}>
              <Text style={styles.valor}>{favoritos.length}</Text>
              <Text style={styles.rotulo}>Favoritos</Text>
            </View>
            <View style={styles.linhaVertical} />
            <View style={styles.numero}>
              <Text style={styles.valor}>{visitados.length}</Text>
              <Text style={styles.rotulo}>Visitados</Text>
            </View>
          </View>
        </View>

        {/* Abas */}
        <View style={styles.seletor}>
          <TouchableOpacity
            style={[styles.opcaoAba, aba === 'preferencias' && styles.opcaoAbaAtiva]}
            onPress={() => setAba('preferencias')}
          >
            <Text style={[styles.textoAba, aba === 'preferencias' && styles.textoAbaAtivo]}>
              Preferências
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.opcaoAba, aba === 'favoritos' && styles.opcaoAbaAtiva]}
            onPress={() => setAba('favoritos')}
          >
            <Text style={[styles.textoAba, aba === 'favoritos' && styles.textoAbaAtivo]}>
              Favoritos
            </Text>
          </TouchableOpacity>
        </View>

        {aba === 'preferencias' ? (
          <View style={styles.bloco}>
            <Text style={styles.tituloBloco}>Preferências de passeio</Text>
            <Text style={styles.textoBloco}>
              Escolha o que você gosta para personalizar as recomendações.
            </Text>

            <View style={styles.chips}>
              {OPCOES.map((item) => {
                const ativo = escolhidas.includes(item);
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.chip, ativo && styles.chipAtivo]}
                    onPress={() => alternar(item)}
                    activeOpacity={0.7}
                  >
                    {ativo && <Ionicons name="checkmark" size={14} color="#0097b2" />}
                    <Text style={[styles.textoChip, ativo && styles.textoChipAtivo]}>{item}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.contador}>
              {escolhidas.length} {escolhidas.length === 1 ? 'selecionada' : 'selecionadas'}
            </Text>
          </View>
        ) : (
          <View style={styles.bloco}>
            <Text style={styles.tituloBloco}>Meus favoritos</Text>

            {favoritos.length === 0 ? (
              <View style={styles.vazio}>
                <Ionicons name="heart-outline" size={40} color="#b0bec5" />
                <Text style={styles.textoVazio}>Você ainda não favoritou nenhum local.</Text>
              </View>
            ) : (
              favoritos.map((local) => (
                <View key={local.id} style={styles.itemFavorito}>
                  <Ionicons name="heart" size={18} color="#e53935" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nomeFavorito}>{local.nome}</Text>
                    <Text style={styles.bairroFavorito}>{local.bairro}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        <TouchableOpacity style={styles.botaoSair} onPress={aoSair} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={20} color="#e53935" />
          <Text style={styles.textoSair}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>

      <Navbar abaAtiva="profile" aoMudarAba={aoMudarAba} totalFavoritos={favoritos.length} />
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

  conteudo: { padding: 20, paddingBottom: 130, gap: 18 },

  cardUsuario: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    minHeight: 330,
    justifyContent: 'center',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#0097b2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  nome: { fontSize: 22, fontWeight: 'bold', color: '#333333' },
  email: { fontSize: 14, color: '#666666', marginTop: 4 },
  divisor: { width: '100%', height: 1, backgroundColor: '#e0e0e0', marginVertical: 24 },
  numeros: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  numero: { flex: 1, alignItems: 'center' },
  valor: { fontSize: 30, fontWeight: 'bold', color: '#0097b2' },
  rotulo: { fontSize: 13, color: '#666666', marginTop: 4 },
  linhaVertical: { width: 1, height: 44, backgroundColor: '#e0e0e0' },

  seletor: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 4,
  },
  opcaoAba: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  opcaoAbaAtiva: { backgroundColor: '#0097b2' },
  textoAba: { fontSize: 14, fontWeight: '600', color: '#666666', minWidth: 110, textAlign: 'center' },
  textoAbaAtivo: { color: '#ffffff' },

  bloco: { backgroundColor: '#f5f5f5', borderRadius: 15, padding: 16, gap: 8 },
  tituloBloco: { fontSize: 16, fontWeight: 'bold', color: '#333333' },
  textoBloco: { fontSize: 14, color: '#666666', lineHeight: 20 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipAtivo: { backgroundColor: '#e0f7fa', borderColor: '#0097b2' },
  textoChip: { fontSize: 14, color: '#666666',  minWidth: 86 },
  textoChipAtivo: { color: '#0097b2', fontWeight: '600' },
  contador: { fontSize: 12, color: '#999999', marginTop: 4 },

  vazio: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  textoVazio: { fontSize: 14, color: '#999999', textAlign: 'center' },
  itemFavorito: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
  },
  nomeFavorito: { fontSize: 15, fontWeight: 'bold', color: '#333333' },
  bairroFavorito: { fontSize: 12, color: '#0097b2', marginTop: 2 },

  botaoSair: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f5c6c4',
  },
  textoSair: { fontSize: 15, color: '#e53935', minWidth: 110 },
});