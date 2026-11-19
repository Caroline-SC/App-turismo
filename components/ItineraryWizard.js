import { useState } from 'react';
import { Keyboard, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Text from './AppText';
import Ionicons from '@expo/vector-icons/Ionicons';
import { normalizar } from '../services/adapters';
import { erroEtapa, pedidoDoFormulario, PERGUNTAS_ROTEIRO } from '../services/itineraryForm';

const INTERESSES = ['História Colonial', 'Cultura Afro-baiana', 'Praias e Mirantes', 'Gastronomia Típica', 'Igrejas e Fé', 'Museus e Artes', 'Música e Boemia'];
const DESCRICOES = ['Vamos descobrir os melhores lugares da cidade.', 'Selecione um ou mais interesses. Você também pode escolher lugares específicos na próxima etapa.', 'Esta etapa é opcional. Se preferir, deixe que o Citour escolha os pontos.', 'Esse intervalo será usado em cada dia. A pausa de restaurante só entra se o passeio passar por 12h–13h.', 'O tamanho do grupo ajuda a calcular custos e o tempo das visitas.', 'Vamos considerar esse transporte entre os pontos turísticos.', 'Use os botões ou digite a quantidade. Depois, é só gerar seu roteiro.'];
const INICIAL = { nome: '', cidade: 'Salvador', interesses: ['História Colonial', 'Cultura Afro-baiana', 'Gastronomia Típica'], pontosEscolhidos: [], horaInicio: '09:00', horaFim: '18:00', pessoas: '1', transporte: 'a_pe', dias: '3' };

export default function ItineraryWizard({ pontos, carregandoPontos, erroPontos, aoAtualizar, aoGerar, aoMudarEtapa }) {
  const [etapa, setEtapa] = useState(0), [dados, setDados] = useState(INICIAL), [busca, setBusca] = useState(''), [erro, setErro] = useState('');
  const alterar = (campo, valor) => { setDados(atual => ({ ...atual, [campo]: valor })); setErro(''); };
  const alternar = item => alterar('interesses', dados.interesses.includes(item) ? dados.interesses.filter(i => i !== item) : [...dados.interesses, item]);
  const resultados = busca.trim() ? pontos.filter(p => normalizar(p.nome + ' ' + p.bairro).includes(normalizar(busca)) && !dados.pontosEscolhidos.some(x => x.id === p.id)).slice(0, 8) : [];
  const avancar = () => {
    Keyboard.dismiss();
    const mensagem = erroEtapa(etapa, dados);
    if (mensagem) { setErro(mensagem); return; }
    if (etapa < 6) { setEtapa(etapa + 1); setErro(''); aoMudarEtapa(); return; }
    try { aoGerar(pedidoDoFormulario(dados)); } catch (e) { setErro(e.message); }
  };
  return <View style={styles.card}>
    <View style={styles.progressoTopo}><Text style={styles.etapa}>{`ETAPA ${etapa + 1} DE ${PERGUNTAS_ROTEIRO.length}`}</Text><Ionicons name="sparkles-outline" size={20} color="#0097b2" /></View>
    <View style={styles.barra}><View style={[styles.barraPreenchida, { width: `${(etapa + 1) / PERGUNTAS_ROTEIRO.length * 100}%` }]} /></View>
    <Text accessibilityRole="header" accessibilityLiveRegion="polite" style={styles.titulo}>{PERGUNTAS_ROTEIRO[etapa]}</Text>
    <Text style={styles.descricao}>{DESCRICOES[etapa]}</Text>
    <View key={etapa} style={styles.pergunta}>
      {etapa === 0 && <TextInput accessibilityLabel="Cidade de destino" style={styles.input} value={dados.cidade} onChangeText={v => alterar('cidade', v)} placeholder="Salvador" />}
      {etapa === 1 && <View style={styles.chips}>{INTERESSES.map(item => {
        const ativo = dados.interesses.includes(item);
        return <TouchableOpacity accessibilityRole="checkbox" accessibilityState={{ checked: ativo }} key={item} onPress={() => alternar(item)} style={[styles.chip, ativo && styles.chipAtivo]}>
          {ativo && <Ionicons name="checkmark" size={16} color="#0097b2" />}<Text style={[styles.chipTexto, ativo && styles.textoAtivo]}>{item}</Text>
        </TouchableOpacity>;
      })}</View>}
      {etapa === 2 && <>
        <TextInput accessibilityLabel="Pesquisar pontos específicos" style={styles.input} value={busca} onChangeText={setBusca} placeholder="Pesquise pelo nome ou bairro" autoCorrect={false} />
        {carregandoPontos && <Text style={styles.ajuda}>Carregando lugares…</Text>}
        {Boolean(erroPontos) && <TouchableOpacity onPress={aoAtualizar}><Text style={styles.erro}>{erroPontos} Toque para tentar novamente.</Text></TouchableOpacity>}
        {resultados.map(p => <TouchableOpacity key={p.id} style={styles.local} onPress={() => { alterar('pontosEscolhidos', [...dados.pontosEscolhidos, p]); setBusca(''); }}>
          <View style={{ flex: 1 }}><Text style={styles.localNome}>{p.nome}</Text><Text style={styles.ajuda}>{p.bairro}</Text></View><Ionicons name="add-circle-outline" size={23} color="#0097b2" />
        </TouchableOpacity>)}
        {busca.trim() && !carregandoPontos && !erroPontos && !resultados.length ? <Text style={styles.ajuda}>Nenhum outro lugar encontrado.</Text> : null}
        {dados.pontosEscolhidos.map(p => <View style={[styles.local, styles.localEscolhido]} key={p.id}>
          <Text style={[styles.localNome, { flex: 1, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%' }]}>{p.nome}</Text><TouchableOpacity accessibilityLabel={'Remover ' + p.nome} style={styles.remover} onPress={() => alterar('pontosEscolhidos', dados.pontosEscolhidos.filter(x => x.id !== p.id))}><Ionicons name="close-circle-outline" size={23} color="#0097b2" /></TouchableOpacity>
        </View>)}
        {!dados.pontosEscolhidos.length && <Text style={styles.ajuda}>Nenhum ponto obrigatório selecionado. Você pode continuar assim.</Text>}
      </>}
      {etapa === 3 && <>
        <Text style={styles.rotulo}>Horário de início</Text><TextInput accessibilityLabel="Horário de início" style={styles.input} value={dados.horaInicio} onChangeText={v => alterar('horaInicio', v)} maxLength={5} placeholder="09:00" keyboardType="numbers-and-punctuation" />
        <Text style={styles.rotulo}>Horário de término</Text><TextInput accessibilityLabel="Horário de término" style={styles.input} value={dados.horaFim} onChangeText={v => alterar('horaFim', v)} maxLength={5} placeholder="18:00" keyboardType="numbers-and-punctuation" />
      </>}
      {etapa === 4 && <SeletorNumero titulo="Quantidade de pessoas" singular="pessoa" plural="pessoas" valor={dados.pessoas} maximo={100} alterar={v => alterar('pessoas', v)} />}
      {etapa === 5 && <View style={{ gap: 12 }}>{[{ id: 'a_pe', nome: 'A pé', detalhe: 'Caminhando entre os pontos', icone: 'walk-outline' }, { id: 'carro', nome: 'De carro', detalhe: 'Deslocamentos de carro', icone: 'car-outline' }].map(op => <TouchableOpacity key={op.id} accessibilityRole="radio" accessibilityState={{ selected: dados.transporte === op.id }} style={[styles.transporte, dados.transporte === op.id && styles.chipAtivo]} onPress={() => alterar('transporte', op.id)}>
        <Ionicons name={op.id === 'a_pe' ? 'walk-outline' : 'car-outline'} size={26} color="#0097b2" /><View style={{ flex: 1 }}><Text style={styles.localNome}>{op.nome}</Text><Text style={styles.ajuda}>{op.detalhe}</Text></View><Ionicons name={dados.transporte === op.id ? 'radio-button-on' : 'radio-button-off'} size={22} color="#0097b2" />
      </TouchableOpacity>)}</View>}
      {etapa === 6 && <>
        <Text style={styles.rotulo}>Nome do roteiro (opcional)</Text>
        <TextInput accessibilityLabel="Nome do roteiro" style={styles.input} value={dados.nome} onChangeText={v => alterar('nome', v)} maxLength={120} placeholder="Ex.: Férias em Salvador" returnKeyType="done" />
        <SeletorNumero titulo="Quantidade de dias" singular="dia" plural="dias" valor={dados.dias} maximo={14} alterar={v => alterar('dias', v)} />
        <View style={styles.resumo}><Text style={styles.rotulo}>Tudo pronto para criar</Text><Text style={styles.ajuda}>{dados.cidade} · {dados.horaInicio} às {dados.horaFim}</Text><Text style={styles.ajuda}>{dados.pessoas} {Number(dados.pessoas) === 1 ? 'pessoa' : 'pessoas'} · {dados.transporte === 'a_pe' ? 'A pé' : 'De carro'}</Text><Text style={styles.ajuda}>{dados.interesses.length} interesses · {dados.pontosEscolhidos.length} lugares obrigatórios</Text></View>
        {Boolean(erroPontos) && <TouchableOpacity onPress={aoAtualizar}><Text style={styles.erro}>Não foi possível carregar os lugares. Toque para tentar novamente.</Text></TouchableOpacity>}
      </>}
    </View>
    {Boolean(erro) && <Text accessibilityLiveRegion="assertive" style={styles.erro}>{erro}</Text>}
    <View style={styles.acoes}>
      {etapa > 0 && <TouchableOpacity style={styles.voltar} accessibilityLabel="Voltar à pergunta anterior" onPress={() => { setEtapa(etapa - 1); setErro(''); aoMudarEtapa(); }}><Ionicons name="arrow-back" size={18} color="#0097b2" /><Text style={styles.voltarTexto}>Voltar</Text></TouchableOpacity>}
      <TouchableOpacity style={[styles.continuar, etapa === 6 && (carregandoPontos || Boolean(erroPontos)) && { opacity: 0.5 }]} disabled={etapa === 6 && (carregandoPontos || Boolean(erroPontos))} onPress={avancar} accessibilityRole="button">
        <Text style={styles.continuarTexto}>{etapa === 6 ? carregandoPontos ? 'Carregando lugares…' : 'Gerar roteiro' : 'Continuar'}</Text><Ionicons name={etapa === 6 ? 'sparkles-outline' : 'arrow-forward'} size={18} color="#ffffff" />
      </TouchableOpacity>
    </View>
  </View>;
}

function SeletorNumero({ titulo, singular, plural, valor, alterar, maximo }) {
  const numero = Number(valor);
  const mudar = delta => alterar(String(Math.min(maximo, Math.max(1, (numero || 0) + delta))));
  return <View style={styles.seletorNumero}>
    <Text style={[styles.rotulo, { textAlign: 'center' }]}>{titulo}</Text><View style={styles.numeroLinha}>
      <TouchableOpacity accessibilityLabel={'Diminuir ' + titulo.toLowerCase()} style={[styles.numeroBotao, numero <= 1 && { opacity: 0.4 }]} disabled={numero <= 1} onPress={() => mudar(-1)}><Ionicons name="remove" size={25} color="#0097b2" /></TouchableOpacity>
      <TextInput accessibilityLabel={titulo} style={styles.numeroInput} keyboardType="number-pad" selectTextOnFocus value={valor} maxLength={String(maximo).length} onChangeText={v => alterar(v.replace(/\D/g, ''))} />
      <TouchableOpacity accessibilityLabel={'Aumentar ' + titulo.toLowerCase()} style={[styles.numeroBotao, numero >= maximo && { opacity: 0.4 }]} disabled={numero >= maximo} onPress={() => mudar(1)}><Ionicons name="add" size={25} color="#0097b2" /></TouchableOpacity>
    </View><Text style={[styles.ajuda, { textAlign: 'center' }]}>{`${numero === 1 ? singular : plural} · de 1 a ${maximo}`}</Text>
  </View>;
}

const styles = StyleSheet.create({
  card: { flex: 1, backgroundColor: '#ffffff', borderRadius: 20, padding: 20, minHeight: 410 },
  progressoTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', minWidth: 0, maxWidth: '100%' }, etapa: { fontSize: 11, letterSpacing: 1.2, fontWeight: '800', color: '#0097b2', flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 16 }, barra: { height: 4, borderRadius: 4, backgroundColor: '#eaf2f4', overflow: 'hidden', marginTop: 14, marginBottom: 25 }, barraPreenchida: { height: '100%', backgroundColor: '#0097b2' },
  titulo: { width: '100%', color: '#183c46', fontSize: 23, fontWeight: '800', lineHeight: 30, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%' }, descricao: { width: '100%', color: '#6b7f87', fontSize: 14, lineHeight: 22, marginTop: 9, marginBottom: 22, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%' }, pergunta: { gap: 12, paddingBottom: 18, flexGrow: 1 },
  input: { minHeight: 52, borderRadius: 12, backgroundColor: '#f2f5f7', paddingHorizontal: 14, paddingVertical: 13, fontSize: 16, color: '#203e48' }, rotulo: { width: '100%', color: '#31505c', fontSize: 14, fontWeight: '700', lineHeight: 22, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%' }, ajuda: { width: '100%', color: '#71838a', fontSize: 13, lineHeight: 21, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%' }, erro: { width: '100%', color: '#b53a3a', fontSize: 13, lineHeight: 21, paddingVertical: 10, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, minWidth: 0, maxWidth: '100%' }, chip: { flexDirection: 'row', alignItems: 'center', maxWidth: '100%', borderRadius: 20, backgroundColor: '#f2f4f7', paddingVertical: 10, paddingHorizontal: 12, gap: 6, borderWidth: 1, borderColor: 'transparent', flexWrap: 'wrap', minWidth: 0, width: '100%', minHeight: 44 }, chipAtivo: { backgroundColor: '#e0f7fa', borderColor: '#0097b2' }, chipTexto: { fontSize: 13.5, color: '#52656e', flexShrink: 1, lineHeight: 21, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', flex: 1, width: '85%' }, textoAtivo: { color: '#0097b2', fontWeight: '600', flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%' },
  local: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, backgroundColor: '#f5f8f9', flexWrap: 'wrap', minWidth: 0, maxWidth: '100%' }, localNome: { color: '#264955', fontSize: 14, lineHeight: 22, fontWeight: '700', flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%' }, localEscolhido: { backgroundColor: '#eaf7f9' }, remover: { minWidth: 36, minHeight: 40, alignItems: 'center', justifyContent: 'center' },
  transporte: { flexDirection: 'row', gap: 13, alignItems: 'center', backgroundColor: '#f5f8f9', borderWidth: 1, borderColor: 'transparent', borderRadius: 15, padding: 17, flexWrap: 'wrap', minWidth: 0, maxWidth: '100%' }, seletorNumero: { alignItems: 'center', gap: 13, paddingVertical: 15, width: '100%' }, numeroLinha: { flexDirection: 'row', alignItems: 'center', gap: 0, flexWrap: 'wrap', minWidth: 0, maxWidth: '100%', width: '100%', justifyContent: 'space-between' }, numeroBotao: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#e9f6f8', alignItems: 'center', justifyContent: 'center' }, numeroInput: { minWidth: 0, maxWidth: '50%', fontSize: 42, fontWeight: '800', color: '#0097b2', textAlign: 'center', paddingVertical: 10, width: '50%' },
  resumo: { backgroundColor: '#f3f8f9', borderRadius: 14, padding: 16, gap: 5, marginTop: 8 }, acoes: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 14, flexWrap: 'wrap', minWidth: 0, maxWidth: '100%' }, voltar: { flexDirection: 'row', gap: 6, alignItems: 'center', paddingVertical: 15, paddingRight: 5, flexWrap: 'wrap', minWidth: 0, maxWidth: '100%', width: '32%' }, voltarTexto: { color: '#0097b2', fontWeight: '700', fontSize: 14, minWidth: 0, flexShrink: 1, flexWrap: 'wrap', includeFontPadding: true, maxWidth: '100%', lineHeight: 20, flex: 1 }, continuar: { flexDirection: 'row', gap: 12, justifyContent: 'center', alignItems: 'center', borderRadius: 14, padding: 16, backgroundColor: '#0097b2', flexWrap: 'wrap', minWidth: 0, maxWidth: '100%', width: '62%', minHeight: 52 }, continuarTexto: { color: '#ffffff', fontWeight: '800', fontSize: 15, minWidth: 0, flexShrink: 1, textAlign: 'center', lineHeight: 23, flexWrap: 'wrap', includeFontPadding: true, maxWidth: '100%', flex: 1, width: '75%' },
});
