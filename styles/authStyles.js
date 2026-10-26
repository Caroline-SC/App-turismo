import {StyleSheet} from 'react-native'

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
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    elevation: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  
   },


 conatinerLogo:{
    flexDirection: 'row',       
    alignItems: 'center',         
    marginTop: 60,
    marginLeft:   -30,
    marginRight: 20,
  
  },
  textoTopo: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: -5,
    marginLeft:20
  },
   boasVindas: {
    fontSize: 26,
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
 logo:{
    width: 100,           
    height: 100,          
    resizeMode: 'contain',
  },
  conteudoFormulario: {
    paddingHorizontal: 25,
    justifyContent: 'flex-start',
    marginTop: 60,
  
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
    alignSelf: 'center',       // Centraliza o texto na horizontal
    position: 'absolute',      // Força o componente a ignorar as outras caixas
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
})
