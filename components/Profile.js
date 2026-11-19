import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import Text from './AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import Navbar from './Navbar';
import { avisar } from '../services/notify';
import { interessesApi } from '../services/adapters';
import { alternarPreferencia, opcoesPreferencias } from '../services/profile';
import { useNavbarHeight } from '../hooks/useNavbarHeight';

export default function Profile({
  aoMudarAba,
  aoSair,
  nome = 'Usuário',
  email = 'E-mail não informado',
  favoritos = [],
  visitados = [],
  interesses = [],
  aoSalvarInteresses,
  aoAbrirLocal,
  carregando = false,
  erro = '',
  aoAtualizar,
  aoAlternarFavorito,
}) {
  const insets = useSafeAreaInsets();
  const alturaNav = useNavbarHeight();
  const [aba, setAba] = useState('preferencias');
  const [salvando, setSalvando] = useState(false);
  const [removendo, setRemovendo] = useState(null);
  const ids = interessesApi(interesses);
  const opcoes = opcoesPreferencias(interesses);
  const escolhidas = opcoes.filter(op => op.ids.some(i => ids.includes(i)));

  const alternar = async (item) => {
    if (salvando) return;
    const novas = alternarPreferencia(interesses, item);
    setSalvando(true);
    try { await aoSalvarInteresses(novas); }
    catch (err) { avisar('Preferências', err.message); }
    finally { setSalvando(false); }
  };
  const removerFavorito = async id => {
    if (removendo) return;
    setRemovendo(id);
    try { await aoAlternarFavorito(id, false); }
    catch (err) { avisar('Favoritos', err.message); }
    finally { setRemovendo(null); }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden={false} barStyle="light-content" />

      <View style={[styles.topo, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.titulo}>Meu Perfil</Text>
        <Text style={styles.subtitulo}>Gerencie suas preferências turísticas</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.conteudo, { paddingBottom: alturaNav + 30 }]} showsVerticalScrollIndicator={false}>
        {/* Card do usuário */}
        <View style={styles.cardUsuario}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color="#ffffff" />
          </View>
          <Text style={styles.nome}>{nome}</Text>
          <Text style={styles.email}>{email}</Text>

          <View style={styles.divisor} />

          <View style={styles.numeros}>
            <TouchableOpacity style={styles.numero} onPress={() => setAba('favoritos')} accessibilityRole="button" accessibilityLabel="Ver meus favoritos">
              <Text style={styles.valor}>{favoritos.length}</Text>
              <Text style={styles.rotulo}>Favoritos</Text>
            </TouchableOpacity>
            <View style={styles.linhaVertical} />
            <View style={styles.numero}>
              <Text style={styles.valor}>{visitados.length}</Text>
              <Text style={styles.rotulo}>Visitados</Text>
            </View>
          </View>
        </View>
        {carregando && <View style={styles.atualizando}><ActivityIndicator color="#0097b2" /><Text style={styles.textoBloco}>Atualizando seu perfil…</Text></View>}
        {Boolean(erro) && <TouchableOpacity onPress={aoAtualizar} style={styles.aviso}><Text style={styles.textoBloco}>{erro}</Text><Text style={styles.link}>Toque para tentar novamente</Text></TouchableOpacity>}

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
              {opcoes.map((item) => {
                const ativo = item.ids.some(id => ids.includes(id));
                return (
                  <TouchableOpacity
                    key={item.ids.join('|')}
                    style={[styles.chip, ativo && styles.chipAtivo]}
                    onPress={() => alternar(item)}
                    disabled={salvando}
                    activeOpacity={0.7}
                  >
                    {ativo && <Ionicons name="checkmark" size={14} color="#0097b2" />}
                    <Text style={[styles.textoChip, ativo && styles.textoChipAtivo]}>{item.titulo}</Text>
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
                <Text style={styles.textoVazio}>{carregando ? 'Buscando seus favoritos…' : erro ? 'Não foi possível atualizar os favoritos. Tente novamente acima.' : 'Você ainda não favoritou nenhum local. Toque no coração de um ponto no Explorar.'}</Text>
              </View>
            ) : (
              favoritos.map((local) => (
                <View key={local.id} style={styles.itemFavorito}>
                  <TouchableOpacity onPress={() => removerFavorito(local.id)} disabled={Boolean(removendo)} accessibilityRole="button" accessibilityLabel={'Remover ' + local.nome + ' dos favoritos'} style={styles.removerFavorito}>
                    {removendo === local.id ? <ActivityIndicator size="small" color="#e53935" /> : <Ionicons name="heart" size={21} color="#e53935" />}
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.dadosFavorito} onPress={() => aoAbrirLocal(local)} disabled={local.indisponivel} accessibilityRole="button" accessibilityLabel={'Abrir ' + local.nome}>
                    <Text style={styles.nomeFavorito}>{local.nome}</Text>
                    <Text style={styles.bairroFavorito}>{local.bairro}</Text>
                  </TouchableOpacity>
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
  topo: { backgroundColor: '#0097b2', paddingHorizontal: 25, paddingTop: 60, paddingBottom: 25, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#ffffff', flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 34 },
  subtitulo: { fontSize: 14, color: '#e0f7fa', marginTop: 2, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 20 },

  conteudo: { padding: 20, paddingBottom: 130, gap: 18 },

  cardUsuario: { backgroundColor: '#f5f5f5', borderRadius: 20, paddingVertical: 32, paddingHorizontal: 20, alignItems: 'center', minHeight: 330, justifyContent: 'center' },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#0097b2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  nome: { fontSize: 22, fontWeight: 'bold', color: '#333333', textAlign: 'center', maxWidth: '100%', flexShrink: 1, lineHeight: 29, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, width: '100%' },
  email: { fontSize: 14, color: '#666666', marginTop: 4, textAlign: 'center', maxWidth: '100%', flexShrink: 1, lineHeight: 21, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, width: '100%' },
  divisor: { width: '100%', height: 1, backgroundColor: '#e0e0e0', marginVertical: 24 },
  numeros: { flexDirection: 'row', alignItems: 'center', width: '100%', flexWrap: 'wrap', minWidth: 0, maxWidth: '100%' },
  numero: { flex: 1, alignItems: 'center' },
  valor: { fontSize: 30, fontWeight: 'bold', color: '#0097b2', flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 42 },
  rotulo: { fontSize: 13, color: '#666666', marginTop: 4, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 19 },
  linhaVertical: { width: 1, height: 44, backgroundColor: '#e0e0e0' },

  seletor: { flexDirection: 'row', backgroundColor: '#f0f0f0', borderRadius: 12, padding: 4, flexWrap: 'wrap', minWidth: 0, maxWidth: '100%' },
  opcaoAba: { flex: 1, minWidth: 0, paddingHorizontal: 6, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  opcaoAbaAtiva: { backgroundColor: '#0097b2' },
  textoAba: { fontSize: 14, fontWeight: '600', color: '#666666', flexShrink: 1, textAlign: 'center', lineHeight: 21, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%' },
  textoAbaAtivo: { color: '#ffffff', flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%' },

  bloco: { backgroundColor: '#f5f5f5', borderRadius: 15, padding: 16, gap: 8 },
  tituloBloco: { fontSize: 16, fontWeight: 'bold', color: '#333333', flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 23 },
  textoBloco: { fontSize: 14, color: '#666666', lineHeight: 20, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%' },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6, minWidth: 0, maxWidth: '100%' },
  chip: { maxWidth: '100%', flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e0e0e0', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, flexWrap: 'wrap', minWidth: 0, width: '48%', minHeight: 44 },
  chipAtivo: { backgroundColor: '#e0f7fa', borderColor: '#0097b2' },
  textoChip: { fontSize: 14, color: '#666666', flexShrink: 1, minWidth: 0, lineHeight: 21, textAlign:'center', flexWrap: 'wrap', includeFontPadding: true, maxWidth: '100%', flex: 1, width: '80%' },
  textoChipAtivo: { color: '#0097b2', fontWeight: '600', minWidth: 0, textAlign:'center', flexShrink: 1, flexWrap: 'wrap', includeFontPadding: true, maxWidth: '100%' },
  contador: { fontSize: 12, color: '#999999', marginTop: 4, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 17 },

  vazio: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  textoVazio: { fontSize: 14, color: '#999999', textAlign: 'center', flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 20 },
  itemFavorito: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#ffffff', borderRadius: 12, padding: 12, flexWrap: 'wrap', minWidth: 0, maxWidth: '100%' },
  dadosFavorito: { flex: 1, minWidth: 0, paddingVertical: 5 }, removerFavorito: { minWidth: 36, minHeight: 42, alignItems: 'center', justifyContent: 'center' },
  nomeFavorito: { fontSize: 15, fontWeight: 'bold', color: '#333333', flexShrink: 1, lineHeight: 22, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%' },
  bairroFavorito: { fontSize: 12, color: '#0097b2', marginTop: 2, flexShrink: 1, lineHeight: 18, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%' },
  atualizando: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap', minWidth: 0, maxWidth: '100%' }, aviso: { backgroundColor: '#e8f5f7', borderRadius: 12, padding: 14, gap: 6 }, link: { color: '#0097b2', fontWeight: '700', fontSize: 12, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 17 },

  botaoSair: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#f5c6c4', flexWrap: 'wrap', minWidth: 0, maxWidth: '100%', minHeight: 48 },
  textoSair: { fontSize: 15, color: '#e53935', flexShrink: 1, lineHeight: 22, minWidth: 0, textAlign:'center', flexWrap: 'wrap', includeFontPadding: true, maxWidth: '100%', width: '75%' },
});
