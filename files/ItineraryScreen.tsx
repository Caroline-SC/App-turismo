import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Sparkles, Calendar, Wallet, Compass, Heart, Share2, Check, Clock, MapPin, ShieldCheck, Utensils, Trash2, ArrowRight } from 'lucide-react';
import { ApiService } from '../services/api';
import { ConteudoRoteiro, Roteiro } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';

interface ItineraryScreenProps {
  onOpenPlaceByName?: (name: string) => void;
}

const INTERESSES_OPCOES = [
  'História Colonial',
  'Cultura Afro-baiana',
  'Praias e Mirantes',
  'Gastronomia Típica',
  'Igrejas e Fé',
  'Museus e Artes',
  'Música e Boemia',
];

const DIAS_OPCOES = [1, 2, 3, 4, 5, 7];
const RITMO_OPCOES = ['Tranquilo', 'Moderado', 'Intenso'];
const COMPANHIA_OPCOES = ['Sozinho', 'Casal', 'Família', 'Amigos'];

export const ItineraryScreen: React.FC<ItineraryScreenProps> = ({ onOpenPlaceByName }) => {
  const { usuario } = useAuth();
  const { roteirosSalvos, salvarRoteiro, removerRoteiro } = useFavorites();

  const [activeTab, setActiveTab] = useState<'gerador' | 'salvos'>('gerador');
  const [destino, setDestino] = useState('Salvador');
  const [dias, setDias] = useState<number>(3);
  const [interesses, setInteresses] = useState<string[]>(['História Colonial', 'Cultura Afro-baiana', 'Gastronomia Típica']);
  const [orcamento, setOrcamento] = useState('500');
  const [ritmo, setRitmo] = useState('Moderado');
  const [companhia, setCompanhia] = useState('Casal');

  const [gerando, setGerando] = useState(false);
  const [roteiroGerado, setRoteiroGerado] = useState<ConteudoRoteiro | null>(null);
  const [roteiroOrigem, setRoteiroOrigem] = useState<string>('');
  const [salvoComSucesso, setSalvoComSucesso] = useState(false);
  const [erroMsg, setErroMsg] = useState<string | null>(null);

  const toggleInteresse = (item: string) => {
    if (interesses.includes(item)) {
      if (interesses.length > 1) {
        setInteresses(interesses.filter((i) => i !== item));
      }
    } else {
      setInteresses([...interesses, item]);
    }
  };

  const handleGerarRoteiro = async () => {
    setGerando(true);
    setErroMsg(null);
    setSalvoComSucesso(false);

    try {
      const res = await ApiService.gerarRoteiroPersonalizado({
        destination: destino.trim() || 'Salvador',
        days: dias,
        interests: interesses,
        budget: Number(orcamento) || 500,
        pace: ritmo,
        companions: companhia,
      });

      if (res.sucesso && res.dados) {
        setRoteiroGerado(res.dados);
        setRoteiroOrigem(res.source);
      } else {
        setErroMsg('Não foi possível gerar o roteiro neste momento. Tente novamente.');
      }
    } catch (e: any) {
      setErroMsg('Erro ao contatar o assistente inteligente de viagens: ' + e?.message);
    } finally {
      setGerando(false);
    }
  };

  const handleSalvarRoteiroAtual = async () => {
    if (!roteiroGerado || !usuario) return;

    const novo: Roteiro = {
      id: `rot-${Date.now()}`,
      usuarioId: usuario.id,
      destino: destino,
      duracao: dias,
      interesses: interesses,
      orcamento: orcamento,
      ritmo: ritmo,
      companhia: companhia,
      dataCriacao: new Date().toLocaleDateString('pt-BR'),
      conteudo: roteiroGerado,
    };

    await salvarRoteiro(novo);
    setSalvoComSucesso(true);
  };

  const handleCompartilhar = () => {
    if (navigator.share && roteiroGerado) {
      navigator.share({
        title: roteiroGerado.titulo,
        text: `Confira meu roteiro inteligente em Salvador gerado pelo CITOUR: ${roteiroGerado.resumo}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      alert('Roteiro copiado para compartilhamento!');
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Banner Bar */}
      <View style={styles.headerBar}>
        <View style={styles.headerTitleRow}>
          <View style={styles.sparkleBox}>
            <Sparkles size={20} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Roteiros Inteligentes</Text>
            <Text style={styles.headerSubtitle}>Criação sob medida com Inteligência Artificial</Text>
          </View>
        </View>

        {/* Tab switch between Generator and Saved */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'gerador' && styles.tabButtonActive]}
            activeOpacity={0.8}
            onPress={() => setActiveTab('gerador')}
          >
            <Text style={[styles.tabText, activeTab === 'gerador' && styles.tabTextActive]}>
              Criar Novo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'salvos' && styles.tabButtonActive]}
            activeOpacity={0.8}
            onPress={() => setActiveTab('salvos')}
          >
            <Text style={[styles.tabText, activeTab === 'salvos' && styles.tabTextActive]}>
              Salvos ({roteirosSalvos.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} bounces={false}>
        {activeTab === 'gerador' ? (
          <>
            {!roteiroGerado ? (
              <View style={styles.formCard}>
                <Text style={styles.formPromptTitle}>Personalize suas Preferências</Text>
                <Text style={styles.formPromptSub}>
                  O Citour utiliza IA para organizar os melhores passeios históricos, museus e culinária para seu tempo e bolso.
                </Text>

                {erroMsg && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{erroMsg}</Text>
                  </View>
                )}

                {/* Destino input */}
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>Cidade de Destino</Text>
                  <TextInput
                    style={styles.textInput}
                    value={destino}
                    onChangeText={setDestino}
                    placeholder="Ex: Salvador"
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                {/* Quantidade de Dias */}
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>Quantidade de Dias</Text>
                  <View style={styles.optionsRow}>
                    {DIAS_OPCOES.map((d) => (
                      <TouchableOpacity
                        key={d}
                        style={[styles.pillOption, dias === d && styles.pillOptionActive]}
                        activeOpacity={0.7}
                        onPress={() => setDias(d)}
                      >
                        <Text style={[styles.pillOptionText, dias === d && styles.pillOptionTextActive]}>
                          {d} {d === 1 ? 'dia' : 'dias'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Interesses */}
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>Seus Interesses Principais</Text>
                  <View style={styles.tagsContainer}>
                    {INTERESSES_OPCOES.map((item) => {
                      const selected = interesses.includes(item);
                      return (
                        <TouchableOpacity
                          key={item}
                          style={[styles.tagItem, selected && styles.tagItemActive]}
                          activeOpacity={0.7}
                          onPress={() => toggleInteresse(item)}
                        >
                          <Text style={[styles.tagItemText, selected && styles.tagItemTextActive]}>
                            {selected ? `✓ ${item}` : item}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Orçamento estimado */}
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>Orçamento Estimado Total (R$)</Text>
                  <View style={styles.inputWithIcon}>
                    <Text style={styles.currencyPrefix}>R$</Text>
                    <TextInput
                      style={styles.currencyInput}
                      keyboardType="numeric"
                      value={orcamento}
                      onChangeText={setOrcamento}
                      placeholder="500"
                    />
                  </View>
                </View>

                {/* Ritmo */}
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>Ritmo da Viagem</Text>
                  <View style={styles.optionsRow}>
                    {RITMO_OPCOES.map((r) => (
                      <TouchableOpacity
                        key={r}
                        style={[styles.pillOption, ritmo === r && styles.pillOptionActive]}
                        activeOpacity={0.7}
                        onPress={() => setRitmo(r)}
                      >
                        <Text style={[styles.pillOptionText, ritmo === r && styles.pillOptionTextActive]}>
                          {r}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Companhia */}
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>Viajando com quem?</Text>
                  <View style={styles.optionsRow}>
                    {COMPANHIA_OPCOES.map((c) => (
                      <TouchableOpacity
                        key={c}
                        style={[styles.pillOption, companhia === c && styles.pillOptionActive]}
                        activeOpacity={0.7}
                        onPress={() => setCompanhia(c)}
                      >
                        <Text style={[styles.pillOptionText, companhia === c && styles.pillOptionTextActive]}>
                          {c}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Generate Button */}
                <TouchableOpacity
                  style={[styles.generateButton, gerando && styles.buttonDisabled]}
                  activeOpacity={0.8}
                  onPress={handleGerarRoteiro}
                  disabled={gerando}
                >
                  {gerando ? (
                    <View style={styles.btnRow}>
                      <ActivityIndicator color="#ffffff" size="small" />
                      <Text style={styles.generateButtonText}>Consultando IA e acervo histórico...</Text>
                    </View>
                  ) : (
                    <View style={styles.btnRow}>
                      <Sparkles size={18} color="#ffffff" />
                      <Text style={styles.generateButtonText}>Gerar Roteiro Personalizado</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              /* Generated Itinerary Display View */
              <View style={styles.itineraryDisplay}>
                {/* Actions Top Strip */}
                <View style={styles.itineraryToolbar}>
                  <TouchableOpacity
                    style={styles.backToFormBtn}
                    onPress={() => setRoteiroGerado(null)}
                  >
                    <Text style={styles.backToFormText}>← Alterar preferências</Text>
                  </TouchableOpacity>

                  <View style={styles.toolbarRight}>
                    <TouchableOpacity
                      style={styles.toolIconBtn}
                      onPress={handleCompartilhar}
                      accessibilityLabel="Compartilhar"
                    >
                      <Share2 size={16} color="#0284c7" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.toolSaveBtn, salvoComSucesso && styles.toolSaveBtnSuccess]}
                      onPress={handleSalvarRoteiroAtual}
                      disabled={salvoComSucesso}
                    >
                      {salvoComSucesso ? (
                        <>
                          <Check size={14} color="#ffffff" />
                          <Text style={styles.toolSaveText}>Salvo</Text>
                        </>
                      ) : (
                        <>
                          <Heart size={14} color="#ffffff" />
                          <Text style={styles.toolSaveText}>Salvar Roteiro</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Title Card */}
                <View style={styles.itineraryHeroCard}>
                  <Text style={styles.itineraryTitle}>{roteiroGerado.titulo}</Text>
                  <Text style={styles.itinerarySummary}>{roteiroGerado.resumo}</Text>

                  <View style={styles.itineraryMetaRow}>
                    <View style={styles.itineraryMetaTag}>
                      <Calendar size={13} color="#0284c7" />
                      <Text style={styles.itineraryMetaText}>{dias} dias em {destino}</Text>
                    </View>
                    <View style={styles.itineraryMetaTag}>
                      <Wallet size={13} color="#059669" />
                      <Text style={styles.itineraryMetaText}>Orçamento: {roteiroGerado.orcamentoEstimadoTotal}</Text>
                    </View>
                  </View>
                </View>

                {/* Days Timeline */}
                <View style={styles.daysList}>
                  {roteiroGerado.dias.map((dia) => (
                    <View key={dia.diaNumero} style={styles.dayCard}>
                      <View style={styles.dayHeader}>
                        <View style={styles.dayBadge}>
                          <Text style={styles.dayBadgeText}>DIA {dia.diaNumero}</Text>
                        </View>
                        <Text style={styles.dayTheme}>{dia.tema.replace(/^Dia \d+:\s*/, '')}</Text>
                      </View>

                      {/* Turno: Manhã */}
                      <View style={styles.shiftBlock}>
                        <View style={styles.shiftLabelRow}>
                          <Clock size={14} color="#0284c7" />
                          <Text style={styles.shiftLabel}>Manhã ({dia.manha.horario})</Text>
                        </View>
                        <Text style={styles.shiftLocalName}>{dia.manha.local}</Text>
                        <Text style={styles.shiftDesc}>{dia.manha.descricao}</Text>
                        {dia.manha.contextoHistorico && (
                          <View style={styles.historyQuote}>
                            <Text style={styles.historyQuoteText}>🏛️ {dia.manha.contextoHistorico}</Text>
                          </View>
                        )}
                        {dia.manha.dicaLocal && (
                          <Text style={styles.tipText}>💡 Dica: {dia.manha.dicaLocal}</Text>
                        )}
                      </View>

                      {/* Turno: Tarde */}
                      <View style={styles.shiftBlock}>
                        <View style={styles.shiftLabelRow}>
                          <Clock size={14} color="#f59e0b" />
                          <Text style={styles.shiftLabel}>Tarde ({dia.tarde.horario})</Text>
                        </View>
                        <Text style={styles.shiftLocalName}>{dia.tarde.local}</Text>
                        <Text style={styles.shiftDesc}>{dia.tarde.descricao}</Text>
                        {dia.tarde.contextoHistorico && (
                          <View style={styles.historyQuote}>
                            <Text style={styles.historyQuoteText}>🏛️ {dia.tarde.contextoHistorico}</Text>
                          </View>
                        )}
                        {dia.tarde.dicaLocal && (
                          <Text style={styles.tipText}>💡 Dica: {dia.tarde.dicaLocal}</Text>
                        )}
                      </View>

                      {/* Turno: Noite */}
                      <View style={styles.shiftBlock}>
                        <View style={styles.shiftLabelRow}>
                          <Clock size={14} color="#6366f1" />
                          <Text style={styles.shiftLabel}>Noite ({dia.noite.horario})</Text>
                        </View>
                        <Text style={styles.shiftLocalName}>{dia.noite.local}</Text>
                        <Text style={styles.shiftDesc}>{dia.noite.descricao}</Text>
                        {dia.noite.contextoHistorico && (
                          <View style={styles.historyQuote}>
                            <Text style={styles.historyQuoteText}>🏛️ {dia.noite.contextoHistorico}</Text>
                          </View>
                        )}
                        {dia.noite.dicaLocal && (
                          <Text style={styles.tipText}>💡 Dica: {dia.noite.dicaLocal}</Text>
                        )}
                      </View>

                      <View style={styles.dayFooter}>
                        <Text style={styles.dayGastoLabel}>Gasto estimado para este dia:</Text>
                        <Text style={styles.dayGastoValue}>{dia.gastoEstimadoDia}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Gastronomia Recomendada */}
                {roteiroGerado.gastronomiaRecomendada && roteiroGerado.gastronomiaRecomendada.length > 0 && (
                  <View style={styles.extraBox}>
                    <View style={styles.extraHeaderRow}>
                      <Utensils size={18} color="#d97706" />
                      <Text style={styles.extraTitle}>Culinária Típica para Vivenciar</Text>
                    </View>
                    {roteiroGerado.gastronomiaRecomendada.map((item, idx) => (
                      <View key={idx} style={styles.extraBulletRow}>
                        <Text style={styles.bulletDot}>•</Text>
                        <Text style={styles.extraText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Dicas de Segurança e Transporte */}
                {roteiroGerado.dicasSegurancaETtransporte && (
                  <View style={styles.extraBox}>
                    <View style={styles.extraHeaderRow}>
                      <ShieldCheck size={18} color="#10b981" />
                      <Text style={styles.extraTitle}>Dicas de Transporte e Segurança</Text>
                    </View>
                    {roteiroGerado.dicasSegurancaETtransporte.map((dica, idx) => (
                      <View key={idx} style={styles.extraBulletRow}>
                        <Text style={styles.bulletDot}>•</Text>
                        <Text style={styles.extraText}>{dica}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <TouchableOpacity
                  style={styles.newItineraryBtn}
                  onPress={() => setRoteiroGerado(null)}
                >
                  <Text style={styles.newItineraryBtnText}>Gerar Novo Roteiro</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          /* Saved Itineraries View */
          <View style={styles.savedSection}>
            <Text style={styles.savedHeading}>Roteiros Gravados</Text>
            {roteirosSalvos.length === 0 ? (
              <View style={styles.emptySavedBox}>
                <Compass size={40} color="#cbd5e1" />
                <Text style={styles.emptySavedTitle}>Nenhum roteiro salvo ainda</Text>
                <Text style={styles.emptySavedDesc}>
                  Utilize a aba "Criar Novo" para gerar e arquivar roteiros turísticos personalizados para sua viagem.
                </Text>
                <TouchableOpacity
                  style={styles.createFirstBtn}
                  onPress={() => setActiveTab('gerador')}
                >
                  <Text style={styles.createFirstBtnText}>Criar Roteiro Agora</Text>
                </TouchableOpacity>
              </View>
            ) : (
              roteirosSalvos.map((rot) => (
                <View key={rot.id} style={styles.savedCard}>
                  <View style={styles.savedCardTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.savedCardTitle}>{rot.conteudo.titulo}</Text>
                      <Text style={styles.savedCardMeta}>
                        {rot.duracao} dias em {rot.destino} · Salvo em {rot.dataCriacao}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => removerRoteiro(rot.id)}
                      style={styles.deleteSavedBtn}
                      accessibilityLabel="Remover roteiro"
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.savedCardDesc} numberOfLines={2}>
                    {rot.conteudo.resumo}
                  </Text>

                  <TouchableOpacity
                    style={styles.viewSavedBtn}
                    onPress={() => {
                      setRoteiroGerado(rot.conteudo);
                      setActiveTab('gerador');
                    }}
                  >
                    <Text style={styles.viewSavedBtnText}>Visualizar Roteiro Completo</Text>
                    <ArrowRight size={14} color="#0284c7" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerBar: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  sparkleBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#e0f2fe',
    marginTop: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 10,
    padding: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#ffffff',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e0f2fe',
  },
  tabTextActive: {
    color: '#0284c7',
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  formPromptTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  formPromptSub: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 20,
    lineHeight: 18,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 12,
  },
  formField: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 14,
    color: '#0f172a',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pillOption: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pillOptionActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  pillOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  pillOptionTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagItem: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tagItemActive: {
    backgroundColor: '#e0f2fe',
    borderColor: '#0284c7',
  },
  tagItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  tagItemTextActive: {
    color: '#0284c7',
    fontWeight: '700',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
  },
  currencyPrefix: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
    marginRight: 8,
  },
  currencyInput: {
    flex: 1,
    height: 46,
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '600',
  },
  generateButton: {
    backgroundColor: '#0284c7',
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  itineraryDisplay: {
    gap: 16,
  },
  itineraryToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backToFormBtn: {
    paddingVertical: 4,
  },
  backToFormText: {
    fontSize: 13,
    color: '#0284c7',
    fontWeight: '600',
  },
  toolbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolSaveBtn: {
    backgroundColor: '#0284c7',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  toolSaveBtnSuccess: {
    backgroundColor: '#10b981',
  },
  toolSaveText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  itineraryHeroCard: {
    backgroundColor: '#0369a1',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#0369a1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  itineraryTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 24,
  },
  itinerarySummary: {
    fontSize: 13,
    color: '#e0f2fe',
    marginTop: 6,
    lineHeight: 18,
  },
  itineraryMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  itineraryMetaTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itineraryMetaText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '600',
  },
  daysList: {
    gap: 16,
  },
  dayCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 10,
  },
  dayBadge: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dayBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  dayTheme: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
  },
  shiftBlock: {
    marginBottom: 14,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  shiftLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  shiftLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  shiftLocalName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  shiftDesc: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  historyQuote: {
    marginTop: 8,
    backgroundColor: '#f0f9ff',
    padding: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0284c7',
  },
  historyQuoteText: {
    fontSize: 11,
    color: '#0369a1',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  tipText: {
    fontSize: 11,
    color: '#059669',
    marginTop: 6,
    fontWeight: '600',
  },
  dayFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
    marginTop: 4,
  },
  dayGastoLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  dayGastoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
  },
  extraBox: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  extraHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  extraTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  extraBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  bulletDot: {
    fontSize: 14,
    color: '#0284c7',
  },
  extraText: {
    fontSize: 12,
    color: '#334155',
    flex: 1,
    lineHeight: 17,
  },
  newItineraryBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  newItineraryBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  savedSection: {
    gap: 14,
  },
  savedHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  emptySavedBox: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptySavedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginTop: 12,
  },
  emptySavedDesc: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    marginBottom: 16,
  },
  createFirstBtn: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  createFirstBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  savedCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  savedCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  savedCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  savedCardMeta: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  deleteSavedBtn: {
    padding: 4,
  },
  savedCardDesc: {
    fontSize: 12,
    color: '#475569',
    marginTop: 8,
    lineHeight: 17,
  },
  viewSavedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  viewSavedBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284c7',
  },
});

export default ItineraryScreen;
