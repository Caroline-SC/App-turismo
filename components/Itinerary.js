import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Navbar from './Navbar';
import { places } from './place';

const OPCOES_DIAS = ['1 dia', '2 dias', '3 dias', '4 dias', '5 dias', '7 dias'];

const OPCOES_INTERESSES = [
  'História Colonial',
  'Cultura Afro-baiana',
  'Praias e Mirantes',
  'Gastronomia Típica',
  'Igrejas e Fé',
  'Museus e Artes',
  'Música e Boemia',
];

export default function Itinerary({ aoMudarAba }) {
  const [abaInterna, setAbaInterna] = useState('criar'); // 'criar' ou 'salvos'
  const [cidade, setCidade] = useState('Salvador');
  const [diasSelecionados, setDiasSelecionados] = useState('3 dias');

  // Novos estados: Horário e Pesquisa de pontos específicos
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFim, setHoraFim] = useState('18:00');
  const [buscaPonto, setBuscaPonto] = useState('');
  const [pontosEscolhidos, setPontosEscolhidos] = useState([]);

  const [interesses, setInteresses] = useState([
    'História Colonial',
    'Cultura Afro-baiana',
    'Gastronomia Típica',
  ]);
  const [roteirosSalvos, setRoteirosSalvos] = useState([]);

  const alternarInteresse = (item) => {
    setInteresses((atual) =>
      atual.includes(item) ? atual.filter((i) => i !== item) : [...atual, item]
    );
  };

  // Filtra os locais de place.js conforme o texto digitado
  const termoBusca = buscaPonto.trim().toLowerCase();
  const sugestoesPontos = termoBusca
    ? places.filter(
        (p) =>
          p.nome.toLowerCase().includes(termoBusca) &&
          !pontosEscolhidos.includes(p.nome)
      )
    : [];

  const adicionarPonto = (nomePonto) => {
    const limpo = nomePonto.trim();
    if (!limpo) return;
    if (!pontosEscolhidos.includes(limpo)) {
      setPontosEscolhidos((atual) => [...atual, limpo]);
    }
    setBuscaPonto('');
  };

  const removerPonto = (nomePonto) => {
    setPontosEscolhidos((atual) => atual.filter((p) => p !== nomePonto));
  };

  const gerarRoteiro = () => {
    if (!cidade.trim()) {
      Alert.alert('Atenção', 'Informe a cidade de destino.');
      return;
    }

    if (!horaInicio.trim() || !horaFim.trim()) {
      Alert.alert('Atenção', 'Informe o horário de início e término.');
      return;
    }

    if (interesses.length === 0 && pontosEscolhidos.length === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos um interesse ou ponto turístico.');
      return;
    }

    const textoPontos =
      pontosEscolhidos.length > 0
        ? ` Incluindo: ${pontosEscolhidos.join(', ')}.`
        : '';

    const novoRoteiro = {
      id: Date.now().toString(),
      cidade: cidade.trim(),
      dias: diasSelecionados,
      horario: `${horaInicio.trim()} às ${horaFim.trim()}`,
      pontos: [...pontosEscolhidos],
      interesses: [...interesses],
      resumo: `Roteiro de ${diasSelecionados} em ${cidade.trim()} (${horaInicio.trim()} até ${horaFim.trim()}) focado em ${interesses.join(', ')}.${textoPontos}`,
    };

    setRoteirosSalvos((anteriores) => [novoRoteiro, ...anteriores]);
    Alert.alert('Roteiro Gerado!', 'Seu roteiro foi criado e salvo na aba "Salvos".');
    setAbaInterna('salvos');
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />

      {/* Topo Azul */}
      <View style={styles.topo}>
        <View style={styles.cabecalhoTopo}>
          <View style={styles.circuloIcone}>
            <Ionicons name="sparkles-outline" size={24} color="#ffffff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.titulo}>Roteiros Inteligentes</Text>
            <Text style={styles.subtitulo}>
              Criação sob medida com Inteligência Artificial
            </Text>
          </View>
        </View>

        {/* Seletor Criar Novo / Salvos */}
        <View style={styles.seletorTopo}>
          <TouchableOpacity
            style={[styles.abaTopo, abaInterna === 'criar' && styles.abaTopoAtiva]}
            onPress={() => setAbaInterna('criar')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.textoAbaTopo,
                abaInterna === 'criar' && styles.textoAbaTopoAtiva,
              ]}
            >
              Criar Novo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.abaTopo, abaInterna === 'salvos' && styles.abaTopoAtiva]}
            onPress={() => setAbaInterna('salvos')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.textoAbaTopo,
                abaInterna === 'salvos' && styles.textoAbaTopoAtiva,
              ]}
            >
              Salvos ({roteirosSalvos.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {abaInterna === 'criar' ? (
          <View style={styles.cardPrincipal}>
            <Text style={styles.tituloCard}>Personalize suas Preferências</Text>
            <Text style={styles.descricaoCard}>
              O Citour utiliza IA para organizar os melhores passeios históricos, museus e
              culinária para seu tempo e bolso.
            </Text>

            {/* Cidade de Destino */}
            <Text style={styles.rotuloCampo}>Cidade de Destino</Text>
            <TextInput
              style={styles.inputPadrao}
              value={cidade}
              onChangeText={setCidade}
              placeholder="Ex: Salvador"
              placeholderTextColor="#999999"
            />

            {/* Barra de Pesquisa de Ponto Específico */}
            <Text style={styles.rotuloCampo}>Pontos Específicos (Opcional)</Text>
            <View style={styles.barraBusca}>
              <Ionicons name="search-outline" size={20} color="#888888" />
              <TextInput
                style={styles.inputBusca}
                value={buscaPonto}
                onChangeText={setBuscaPonto}
                placeholder="Pesquisar local (ex: Farol da Barra)"
                placeholderTextColor="#999999"
                onSubmitEditing={() => adicionarPonto(buscaPonto)}
              />
              {buscaPonto.length > 0 && (
                <TouchableOpacity onPress={() => adicionarPonto(buscaPonto)}>
                  <Ionicons name="add-circle" size={24} color="#0097b2" />
                </TouchableOpacity>
              )}
            </View>

            {/* Sugestões filtradas de place.js */}
            {termoBusca.length > 0 && (
              <View style={styles.caixaSugestoes}>
                {sugestoesPontos.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.itemSugestao}
                    onPress={() => adicionarPonto(item.nome)}
                  >
                    <Ionicons name="location-outline" size={16} color="#0097b2" />
                    <Text style={styles.textoSugestao}>
                      {item.nome} <Text style={styles.bairroSugestao}>({item.bairro})</Text>
                    </Text>
                  </TouchableOpacity>
                ))}

                {/* Opção para adicionar o termo digitado caso não esteja na lista */}
                <TouchableOpacity
                  style={styles.itemSugestao}
                  onPress={() => adicionarPonto(buscaPonto)}
                >
                  <Ionicons name="add-outline" size={16} color="#0097b2" />
                  <Text style={styles.textoSugestao}>
                    Adicionar "{buscaPonto.trim()}" ao roteiro
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Chips dos pontos específicos selecionados */}
            {pontosEscolhidos.length > 0 && (
              <View style={styles.listaPontosSelecionados}>
                {pontosEscolhidos.map((ponto) => (
                  <View key={ponto} style={styles.tagPonto}>
                    <Ionicons name="location" size={13} color="#0097b2" />
                    <Text style={styles.textoTagPonto}>{ponto}</Text>
                    <TouchableOpacity onPress={() => removerPonto(ponto)}>
                      <Ionicons name="close" size={15} color="#0097b2" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Especificação de Horário */}
            <Text style={styles.rotuloCampo}>Horário do Passeio</Text>
            <View style={styles.linhaHorarios}>
              <View style={styles.blocoHorario}>
                <Text style={styles.subRotuloHorario}>De</Text>
                <View style={styles.inputHorarioBox}>
                  <Ionicons name="time-outline" size={18} color="#0097b2" />
                  <TextInput
                    style={styles.inputHorario}
                    value={horaInicio}
                    onChangeText={setHoraInicio}
                    placeholder="09:00"
                    placeholderTextColor="#999999"
                    keyboardType="numbers-and-punctuation"
                    maxLength={5}
                  />
                </View>
              </View>

              <View style={styles.blocoHorario}>
                <Text style={styles.subRotuloHorario}>Até</Text>
                <View style={styles.inputHorarioBox}>
                  <Ionicons name="time-outline" size={18} color="#0097b2" />
                  <TextInput
                    style={styles.inputHorario}
                    value={horaFim}
                    onChangeText={setHoraFim}
                    placeholder="18:00"
                    placeholderTextColor="#999999"
                    keyboardType="numbers-and-punctuation"
                    maxLength={5}
                  />
                </View>
              </View>
            </View>

            {/* Quantidade de Dias */}
            <Text style={styles.rotuloCampo}>Quantidade de Dias</Text>
            <View style={styles.gradeDias}>
              {OPCOES_DIAS.map((dia) => {
                const ativo = diasSelecionados === dia;
                return (
                  <TouchableOpacity
                    key={dia}
                    style={[styles.botaoDia, ativo && styles.botaoDiaAtivo]}
                    onPress={() => setDiasSelecionados(dia)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.textoDia, ativo && styles.textoDiaAtivo]}>
                      {dia}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Seus Interesses Principais */}
            <Text style={styles.rotuloCampo}>Seus Interesses Principais</Text>
            <View style={styles.listaInteresses}>
              {OPCOES_INTERESSES.map((item) => {
                const selecionado = interesses.includes(item);
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.chip, selecionado && styles.chipSelecionado]}
                    onPress={() => alternarInteresse(item)}
                    activeOpacity={0.7}
                  >
                    {selecionado && (
                      <Ionicons name="checkmark" size={15} color="#0097b2" />
                    )}
                    <Text
                      style={[
                        styles.textoChip,
                        selecionado && styles.textoChipSelecionado,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Botão Gerar */}
            <TouchableOpacity
              style={styles.botaoGerar}
              onPress={gerarRoteiro}
              activeOpacity={0.8}
            >
              <Ionicons name="sparkles" size={18} color="#ffffff" />
              <Text style={styles.textoBotaoGerar}>Gerar Roteiro com IA</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ gap: 14 }}>
            {roteirosSalvos.length === 0 ? (
              <View style={styles.cardVazio}>
                <Ionicons name="map-outline" size={44} color="#b0bec5" />
                <Text style={styles.tituloVazio}>Nenhum roteiro salvo</Text>
                <Text style={styles.textoVazio}>
                  Crie seu primeiro roteiro personalizado na aba "Criar Novo".
                </Text>
              </View>
            ) : (
              roteirosSalvos.map((roteiro) => (
                <View key={roteiro.id} style={styles.cardSalvo}>
                  <View style={styles.topoCardSalvo}>
                    <Text style={styles.cidadeSalva}>
                      {roteiro.cidade} · {roteiro.dias}
                    </Text>
                    <Text style={styles.horarioSalvo}>{roteiro.horario}</Text>
                  </View>
                  <Text style={styles.resumoSalvo}>{roteiro.resumo}</Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      <Navbar abaAtiva="itinerary" aoMudarAba={aoMudarAba} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7f9',
    width: '100%',
  },
  topo: {
    backgroundColor: '#0097b2',
    paddingHorizontal: 22,
    paddingTop: 55,
    paddingBottom: 22,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  cabecalhoTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 18,
  },
  circuloIcone: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitulo: {
    fontSize: 13,
    color: '#e0f7fa',
    marginTop: 2,
  },
  seletorTopo: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 12,
    padding: 3,
  },
  abaTopo: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  abaTopoAtiva: {
    backgroundColor: '#ffffff',
  },
  textoAbaTopo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e0f7fa',
  },
  textoAbaTopoAtiva: {
    color: '#0097b2',
    fontWeight: 'bold',
  },
  conteudo: {
    padding: 20,
    paddingBottom: 110,
  },
  cardPrincipal: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e6ecef',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  tituloCard: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 6,
  },
  descricaoCard: {
    fontSize: 13.5,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 18,
  },
  rotuloCampo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    marginTop: 8,
  },
  inputPadrao: {
    backgroundColor: '#f2f4f7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e4e8',
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
    color: '#333333',
    marginBottom: 10,
  },

  // Pesquisa de pontos específicos
  barraBusca: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f4f7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e4e8',
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
  },
  inputBusca: {
    flex: 1,
    fontSize: 14.5,
    color: '#333333',
  },
  caixaSugestoes: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e4e8',
    borderRadius: 12,
    marginTop: 6,
    overflow: 'hidden',
  },
  itemSugestao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  textoSugestao: {
    fontSize: 14,
    color: '#333333',
  },
  bairroSugestao: {
    color: '#888888',
    fontSize: 13,
  },
  listaPontosSelecionados: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    marginBottom: 6,
  },
  tagPonto: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#e0f7fa',
    borderWidth: 1,
    borderColor: '#0097b2',
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 11,
  },
  textoTagPonto: {
    fontSize: 13,
    color: '#0097b2',
    fontWeight: '600',
  },

  // Horários
  linhaHorarios: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  blocoHorario: {
    flex: 1,
  },
  subRotuloHorario: {
    fontSize: 12.5,
    color: '#666666',
    marginBottom: 4,
  },
  inputHorarioBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f4f7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e4e8',
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
  },
  inputHorario: {
    flex: 1,
    fontSize: 15,
    color: '#333333',
    fontWeight: '600',
  },

  // Dias e Interesses
  gradeDias: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  botaoDia: {
    backgroundColor: '#f2f4f7',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  botaoDiaAtivo: {
    backgroundColor: '#0097b2',
  },
  textoDia: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555555',
  },
  textoDiaAtivo: {
    color: '#ffffff',
  },
  listaInteresses: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 22,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f2f4f7',
    borderWidth: 1,
    borderColor: 'transparent',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  chipSelecionado: {
    backgroundColor: '#e0f7fa',
    borderColor: '#0097b2',
  },
  textoChip: {
    fontSize: 13.5,
    color: '#555555',
    fontWeight: '500',
    minWidth: 130,
  },
  textoChipSelecionado: {
    color: '#0097b2',
    fontWeight: '700',
  },
  botaoGerar: {
    backgroundColor: '#0097b2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 12,
  },
  textoBotaoGerar: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  cardVazio: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  tituloVazio: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 6,
  },
  textoVazio: {
    fontSize: 13.5,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 20,
  },
  cardSalvo: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 18,
    borderLeftWidth: 5,
    borderLeftColor: '#0097b2',
    gap: 6,
  },
  topoCardSalvo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cidadeSalva: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  horarioSalvo: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: '#0097b2',
    backgroundColor: '#e0f7fa',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  resumoSalvo: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});