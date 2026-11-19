import { StyleSheet } from 'react-native';

export const authStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  topoAzul: { backgroundColor: '#0097b2', width: '100%', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, borderBottomLeftRadius: 5, borderBottomRightRadius: 5, elevation: 9, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, minHeight: 270 },
  conatinerLogo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: 40, flexWrap: 'wrap', minWidth: 0, maxWidth: '100%' },
  logo: { width: 80, height: 80, resizeMode: 'contain' },
  textoTopo: { width: '65%', flexGrow: 1, flexShrink: 1, color: '#ffffff', fontSize: 26, fontWeight: 'bold', marginLeft: 10, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 37 },
  boasVindas: { fontSize: 20, fontWeight: 'bold', color: '#333333', marginBottom: 5, textAlign: 'center', flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 28 },
  instrucao: { fontSize: 14, color: '#666666', marginBottom: 35, textAlign: 'center', flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 20 },
  conteudoFormulario: { paddingHorizontal: 25, justifyContent: 'flex-start', marginTop: 40 },
  input: { width: '100%', backgroundColor: '#f5f5f5', borderRadius: 10, paddingHorizontal: 15, marginBottom: 15, fontSize: 16, color: '#333333', minHeight: 52, paddingVertical: 14 },
  botaoSubmmit: { width: '100%', backgroundColor: '#0097b2', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 15, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, minHeight: 52, paddingVertical: 14, paddingHorizontal: 16 },
  textoBotao: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 26, width: '100%', textAlign: 'center' },
  containerNext: { flexDirection: 'row', justifyContent: 'center', alignSelf: 'center', flexWrap: 'wrap', minWidth: 0, maxWidth: '100%', marginTop: 30, paddingHorizontal: 25, paddingBottom: 40, width: '100%', gap: 4 },
  textoNormal: { fontSize: 14, color: '#666666', flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 20 },
  linkNext: { fontSize: 14, color: '#0288d1', fontWeight: 'bold', textDecorationLine: 'underline', flexShrink: 1, flexWrap: 'wrap', minWidth: 0, includeFontPadding: true, maxWidth: '100%', lineHeight: 20 }, scrollContent: { flexGrow: 1 }});