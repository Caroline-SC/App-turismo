import { StyleSheet } from 'react-native';

export const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  
  },
  topoAzul: {
    backgroundColor: '#0097b2',
    width: '100%',
    height: 270,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20, // Garante espaço nas laterais para o conteúdo não vazar
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    elevation: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  conatinerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%', // Usa a largura total disponível do topoAzul
    marginTop: 40,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  textoTopo: {
    flexShrink: 1,
    color: '#ffffff',
    fontSize: 26,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  boasVindas: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
    textAlign: 'center',
  },
  instrucao: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 35,
    textAlign: 'center',
  },
  conteudoFormulario: {
    paddingHorizontal: 25,
    justifyContent: 'flex-start',
    marginTop: 40,
  },
  input: {
    width: '100%',
    height: 52,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#333333',
  },
  botaoSubmmit: {
    width: '100%',
    height: 52,
    backgroundColor: '#0097b2',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  textoBotao: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  containerNext: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center',
    position: 'absolute',
    bottom: 70,
    
  },
  textoNormal: {
    fontSize: 14,
    color: '#666666',
  },
  linkNext: {
    fontSize: 14,
    color: '#0288d1',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});