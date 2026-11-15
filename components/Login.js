import { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, Image } from 'react-native';
import { authStyles } from '../styles/authStyles';
import { avisar } from '../services/notify';

export default function Login({ aoLogar, irParaCadastro }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);

  const verificarLogin = async () => {
    if (enviando) return;
    if (email === '' || senha === '') {
      avisar("Erro", "Por favor, preencha todos os campos.");
      return;
    }
    setEnviando(true);
    try { await aoLogar(email, senha); }
    catch (err) { avisar('Login', err.message); }
    finally { setEnviando(false); }
  };

  return (
    <View style={authStyles.container}>
      {/* Topo Azul Estilizado */}
      <View style={authStyles.topoAzul}>
      <View style={authStyles.conatinerLogo}>
        <Image
        source={require('../assets/icon.png')}
        style={authStyles.logo}
        />
        <Text style={authStyles.textoTopo}numberOfLines={1}
      adjustsFontSizeToFit={true}
      minimumFontScale={0.6}>Bem vindo ao Citour</Text>
      </View>
      </View>
        
      {/* Conteúdo Central do Formulário */}
      <View style={authStyles.conteudoFormulario}>
        <Text style={authStyles.boasVindas}>Olá, usuário</Text>
        <Text style={authStyles.instrucao}>Faça o login para continuar</Text>

        <TextInput
          style={authStyles.input}
          placeholder="E-mail"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={authStyles.input}
          placeholder="Senha"
          placeholderTextColor="#999"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry={true}
        />

        <TouchableOpacity style={authStyles.botaoSubmmit} onPress={verificarLogin} disabled={enviando}>
          <Text style={authStyles.textoBotao}adjustsFontSizeToFit={true}>{enviando ? 'Entrando…' : 'Entrar'}</Text>
        </TouchableOpacity>
        
      </View>
      <View style={authStyles.containerNext}>
  <Text style={authStyles.textoNormal}numberOfLines={1}
      adjustsFontSizeToFit={true}
      minimumFontScale={0.6}>Não tem uma conta? </Text>
  <TouchableOpacity onPress={irParaCadastro}> 
    <Text style={authStyles.linkNext}adjustsFontSizeToFit={true}>Cadastre-se</Text>
  </TouchableOpacity>
</View>
    </View>
  );
}
