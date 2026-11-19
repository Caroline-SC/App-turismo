import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import Text from './AppText';
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
    <ScrollView style={authStyles.container} contentContainerStyle={authStyles.scrollContent} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
      {/* Topo Azul Estilizado */}
      <View style={authStyles.topoAzul}>
      <View style={authStyles.conatinerLogo}>
        <Image
        source={require('../assets/icon.png')}
        style={authStyles.logo}
        />
        <Text style={authStyles.textoTopo}

      >Bem vindo ao Citour</Text>
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
          <Text style={authStyles.textoBotao}>{enviando ? 'Entrando…' : 'Entrar'}</Text>
        </TouchableOpacity>

      </View>
      <View style={authStyles.containerNext}>
  <Text style={authStyles.textoNormal}

      >Não tem uma conta? </Text>
  <TouchableOpacity onPress={irParaCadastro}>
    <Text style={authStyles.linkNext}>Cadastre-se</Text>
  </TouchableOpacity>
</View>
    </ScrollView>
  );
}
