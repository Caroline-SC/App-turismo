import { useState } from 'react';
import { ActivityIndicator, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import Text from './AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '../context/AppContext';
import { useTrip } from '../hooks/useTrip';
import { dinheiro, enriquecerParada, progressoDoRoteiro, tarefasDoDia } from '../services/trip';
import { avisar, confirmar } from '../services/notify';
import Navbar from './Navbar';
import { useNavbarHeight } from '../hooks/useNavbarHeight';

export default function TripDetail({ roteiroId, aoVoltar, aoIniciar, aoAbrirLocal, aoMudarAba }) {
  const trip = useTrip(roteiroId);
  return trip.roteiro ? <Conteudo key={roteiroId} trip={trip} aoVoltar={aoVoltar} aoIniciar={aoIniciar} aoAbrirLocal={aoAbrirLocal} aoMudarAba={aoMudarAba} /> : <TripState carregando={trip.carregando} erro={trip.erro} tentar={trip.tentar} aoVoltar={aoVoltar} aoMudarAba={aoMudarAba} />;
}
export function TripState({ carregando, erro, tentar, aoVoltar, aoMudarAba }) {
  const alturaNav = useNavbarHeight();
  return <View style={styles.container}><ScrollView contentContainerStyle={[styles.estado, { paddingBottom: alturaNav + 28 }]} style={{ flex: 1 }}>{carregando ? <ActivityIndicator size="large" color="#0097b2" /> : <Ionicons name="map-outline" size={40} color="#0097b2" />}<Text style={styles.nome}>{carregando ? 'Carregando roteiro…' : 'Não foi possível abrir'}</Text><Text style={styles.texto}>{erro}</Text>{!carregando && <TouchableOpacity style={styles.botao} onPress={tentar}><Text style={styles.botaoTexto}>Tentar novamente</Text></TouchableOpacity>}<TouchableOpacity onPress={aoVoltar}><Text style={styles.link}>Voltar aos meus roteiros</Text></TouchableOpacity></ScrollView><Navbar abaAtiva="itinerary" aoMudarAba={aoMudarAba} /></View>;
}
function Conteudo({ trip, aoVoltar, aoIniciar, aoAbrirLocal, aoMudarAba }) {
  const { roteiro, salvando, executar } = trip;
  const { pontos } = useApp();
  const insets = useSafeAreaInsets();
  const alturaNav = useNavbarHeight();
  const [alturaAcao, setAlturaAcao] = useState(85);
  const progresso = progressoDoRoteiro(roteiro);
  const [diaIndex, setDiaIndex] = useState(progresso.dia);
  const dia = roteiro.plano.dias[diaIndex] || roteiro.plano.dias[0];
  const terminado = dia.paradas.every((_, i) => progresso.concluidas.includes(`${diaIndex}:${i}`));
  const emAndamento = diaIndex === progresso.dia && ['em_trajeto', 'visitando', 'pausado'].includes(progresso.status);
  const iniciar = async () => {
    try {
      if (terminado && !await confirmar('Recomeçar este dia?', 'As visitas concluídas deste dia serão reiniciadas.')) return;
      if (diaIndex !== progresso.dia && ['em_trajeto', 'visitando', 'pausado'].includes(progresso.status) && !await confirmar('Mudar de dia?', 'O progresso já concluído será mantido. Deseja começar o dia selecionado?')) return;
      await executar(terminado ? 'reiniciar' : 'iniciar', { dia: diaIndex });
      aoIniciar(roteiro._id);
    } catch (err) { avisar('Iniciar roteiro', err.message); }
  };
  return <View style={styles.container}>
    <StatusBar barStyle="dark-content" />
    <ScrollView contentContainerStyle={{ paddingTop: insets.top + 14, paddingBottom: alturaNav + alturaAcao + 16 }} showsVerticalScrollIndicator={false}>
      <TouchableOpacity onPress={aoVoltar} style={styles.voltar}><Ionicons name="arrow-back" size={21} color="#0097b2" /><Text style={styles.link}>Meus roteiros</Text></TouchableOpacity>
      <View style={styles.cabecalho}><Text style={styles.legenda}>SEU PASSEIO, NO SEU RITMO</Text><Text accessibilityRole="header" style={styles.nome}>{roteiro.nome}</Text><Text style={styles.texto}>{roteiro.plano.parametros.dias} {roteiro.plano.parametros.dias === 1 ? 'dia' : 'dias'} · {roteiro.plano.parametros.pessoas} {roteiro.plano.parametros.pessoas === 1 ? 'pessoa' : 'pessoas'} · {roteiro.plano.parametros.transporte === 'carro' ? 'De carro' : 'A pé'}</Text></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dias}>{roteiro.plano.dias.map((d, i) => <TouchableOpacity key={d.numero} style={[styles.dia, i === diaIndex && styles.diaAtivo]} onPress={() => setDiaIndex(i)}><Text style={[styles.diaTexto, i === diaIndex && styles.diaTextoAtivo]}>{`Dia ${d.numero ?? i + 1}`}</Text></TouchableOpacity>)}</ScrollView>
      <View style={styles.resumo}><View style={styles.resumoColuna}><Text style={styles.resumoValor}>{`${dia.horaInicio} — ${dia.horaFim}`}</Text><Text style={styles.resumoLegenda}>{`${dia.quantidadePontos} pontos${dia.paradas.some(p => p.tipo === 'almoco') ? ' + almoço' : ''}`}</Text></View><View style={styles.resumoColuna}><Text style={styles.resumoValor}>{dinheiro(dia.custoTotalEstimado ?? dia.custoConhecido)}</Text><Text style={styles.resumoLegenda}>{dia.custoTotalEstimado == null ? 'Parcial · há preços a confirmar' : 'Estimativa para o grupo'}</Text></View></View>
      <View style={styles.timeline}>{tarefasDoDia(dia).map((item, i) => {
        if (item.tipo === 'deslocamento') return <View key={'t' + i} style={styles.deslocamento}><Ionicons name={roteiro.plano.parametros.transporte === 'carro' ? 'car-outline' : 'walk-outline'} size={17} color="#6c929b" /><Text style={styles.deslocamentoTexto}>{item.trecho.duracaoMinutos} min · {item.trecho.distanciaKm.toFixed(1).replace('.', ',')} km{item.trecho.fonte !== 'osrm' ? ' · estimativa' : ''}</Text></View>;
        if (item.tipo === 'espera') return <Text key={'e' + i} style={styles.deslocamentoTexto}>Tempo livre antes do almoço · {item.parada.esperaMinutos} min</Text>;
        const parada = enriquecerParada(item.parada, pontos), concluida = progresso.concluidas.includes(`${diaIndex}:${item.indice}`);
        return <View key={'p' + i} style={styles.evento}><View style={[styles.bolinha, concluida && styles.bolinhaFeita]}><Ionicons name={concluida ? 'checkmark' : item.tipo === 'almoco' ? 'restaurant-outline' : 'location-outline'} size={17} color={concluida ? '#ffffff' : '#0097b2'} /></View><View style={styles.card}><View style={styles.cardTopo}><Text style={styles.horario}>{`${parada.inicio} — ${parada.fim}`}</Text>{concluida && <Text style={styles.concluido}>Concluído</Text>}</View><Text style={styles.tituloCard}>{parada.nome}</Text><Text style={styles.textoCard}>{parada.duracaoMinutos} min de {item.tipo === 'almoco' ? 'pausa para comer' : 'visita'} · {dinheiro(parada.custoGrupo)} para o grupo</Text>{item.tipo === 'almoco' && !parada.localConfirmado && <Text style={styles.avisoTexto}>O horário está reservado. Escolha um restaurante nesta região durante o passeio.</Text>}{parada.pontoId && <TouchableOpacity onPress={() => aoAbrirLocal({ id: parada.pontoId })}><Text style={styles.link}>Saiba mais sobre o ponto ↗</Text></TouchableOpacity>}</View></View>;
      })}</View>
      {roteiro.plano.avisos?.length > 0 && <View style={styles.avisos}><Text style={styles.tituloAvisos}>Antes de sair</Text>{roteiro.plano.avisos.map((aviso, i) => <Text key={i} style={styles.avisoTexto}>• {aviso}</Text>)}</View>}
    </ScrollView>
    <View onLayout={e => { const h = e.nativeEvent.layout.height; setAlturaAcao(atual => Math.abs(atual - h) > 1 ? h : atual); }} style={[styles.acaoFixa, { bottom: alturaNav }]}><TouchableOpacity style={styles.botao} onPress={iniciar} disabled={salvando}><Ionicons name="navigate-outline" size={21} color="#ffffff" /><Text style={styles.botaoTexto}>{salvando ? 'Salvando…' : terminado ? 'Recomeçar este dia' : emAndamento ? 'Continuar roteiro' : 'Iniciar roteiro'}</Text></TouchableOpacity></View>
    <Navbar abaAtiva="itinerary" aoMudarAba={aoMudarAba} />
  </View>;
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f9fa' }, estado: { justifyContent: 'center', alignItems: 'center', padding: 28, gap: 20, flexGrow: 1 }, voltar: { marginHorizontal: 22, flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, flexWrap: 'wrap', minWidth: 0, maxWidth: '100%' }, cabecalho: { padding: 23, gap: 10 }, legenda: { color: '#0097b2', fontSize: 9, letterSpacing: 1.8, fontWeight: '800', flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 13 }, nome: { width: '100%', color: '#153c46', fontSize: 28, fontWeight: '800', flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 40 }, texto: { width: '100%', color: '#6d858b', lineHeight: 22, fontSize: 14, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%' }, link: { color: '#0097b2', fontSize: 13, fontWeight: '700', paddingVertical: 8, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 19 },
  dias: { paddingHorizontal: 23, gap: 10, paddingBottom: 18 }, dia: { paddingHorizontal: 21, paddingVertical: 11, backgroundColor: '#e4f1f4', borderRadius: 20 }, diaAtivo: { backgroundColor: '#0097b2' }, diaTexto: { color: '#427583', fontWeight: '700', flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%' }, diaTextoAtivo: { color: '#ffffff', flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%' }, resumo: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 14, padding: 20, marginHorizontal: 22, borderRadius: 20, backgroundColor: '#e6f3f6', minWidth: 0, maxWidth: '100%' }, resumoValor: { width: '100%', fontSize: 15, color: '#153c46', fontWeight: '800', flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 21 }, resumoLegenda: { width: '100%', fontSize: 11, color: '#69858e', marginTop: 6, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 16 },
  resumoColuna: { width: '46%', minWidth: 0 },
  timeline: { margin: 22, borderLeftWidth: 2, borderLeftColor: '#cde6eb', paddingLeft: 22, marginLeft: 38, gap: 13 }, evento: { position: 'relative', paddingBottom: 6 }, bolinha: { position: 'absolute', top: 17, left: -39, height: 32, width: 32, borderRadius: 16, backgroundColor: '#e0f3f6', borderWidth: 3, borderColor: '#f5f9fa', alignItems: 'center', justifyContent: 'center' }, bolinhaFeita: { backgroundColor: '#0097b2' }, card: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e1edf0', padding: 18, borderRadius: 19, gap: 9 }, cardTopo: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 5, minWidth: 0, maxWidth: '100%' }, horario: { color: '#0097b2', fontSize: 12, fontWeight: '800', flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 17 }, concluido: { color: '#47836e', fontSize: 11, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 16 }, tituloCard: { width: '100%', color: '#153c46', fontSize: 18, fontWeight: '700', flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 26 }, textoCard: { width: '100%', color: '#69828b', fontSize: 12, lineHeight: 19, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%' }, deslocamento: { flexDirection: 'row', gap: 7, paddingVertical: 5, flexWrap: 'wrap', minWidth: 0, maxWidth: '100%' }, deslocamentoTexto: { fontSize: 11, lineHeight: 18, color: '#77959e', flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', flex: 1 }, avisos: { marginHorizontal: 23, padding: 18, backgroundColor: '#eaf2f4', borderRadius: 18, gap: 8 }, tituloAvisos: { color: '#153c46', fontWeight: '700', fontSize: 14, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 20 }, avisoTexto: { color: '#6c838a', fontSize: 12, lineHeight: 19, flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%' },
  acaoFixa: { position: 'absolute', left: 0, right: 0, backgroundColor: '#f5f9fa', paddingHorizontal: 22, paddingVertical: 12 }, botao: { backgroundColor: '#0097b2', borderRadius: 24, paddingVertical: 16, paddingHorizontal: 23, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10, flexWrap: 'wrap', minWidth: 0, maxWidth: '100%' }, botaoTexto: { color: '#ffffff', fontSize: 16, fontWeight: '700', flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 23, flex: 1, width: '80%', textAlign: 'center' },
});
