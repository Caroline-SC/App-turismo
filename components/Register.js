import  { useState } from 'react';
import {Text, View, TextInput, TouchableOpacity, Image } from 'react-native';
import { authStyles } from '../styles/authStyles';
import { api } from '../services/api';
import { avisar } from '../services/notify';

export default function Register({ aoCadastrar, irParaLogin }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [enviando, setEnviando] = useState(false);

  const verificarCadastro = async () => {
    if (enviando) return;
    if (nome === '' || email === '' || senha === '' || confirmarSenha === '') {
      avisar("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    if (senha !== confirmarSenha) {
      avisar("Erro", "As senhas não coincidem.");
      return;
    }

    // Passa os dados para a função de cadastro se tudo estiver correto
    setEnviando(true);
    try { await api.register(nome, email, senha); avisar('Cadastro', 'Cadastro realizado! Faça login para continuar.'); aoCadastrar(); }
    catch (err) { avisar('Cadastro', err.message); }
    finally { setEnviando(false); }
  };

  return (
    <View style={authStyles.container}>
      {/* Topo Azul Estilizado */}
      <View style={authStyles.topoAzul}>
        <View style={authStyles.conatinerLogo}>
          <Image source={require('../assets/icon.png')} style={authStyles.logo} />
          <Text style={authStyles.textoTopo}numberOfLines={1}
      adjustsFontSizeToFit={true}
      minimumFontScale={0.6}>Bem vindo ao Citour</Text>
        </View>
      </View>

      {/* Conteúdo Central do Formulário */}
      <View style={authStyles.conteudoFormulario}>
        <Text style={authStyles.boasVindas}>Cadastre-se no Citour</Text>
        <Text style={authStyles.instrucao}>Preencha os campos abaixo</Text>

        <TextInput 
          style={authStyles.input} 
          placeholder="Nome Completo" 
          placeholderTextColor="#999" 
          value={nome} 
          onChangeText={setNome} 
        />

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

        <TextInput 
          style={authStyles.input} 
          placeholder="Confirmar Senha" 
          placeholderTextColor="#999" 
          value={confirmarSenha} 
          onChangeText={setConfirmarSenha} 
          secureTextEntry={true} 
        />

        <TouchableOpacity style={authStyles.botaoSubmmit} onPress={verificarCadastro} disabled={enviando}>
          <Text style={authStyles.textoBotao}adjustsFontSizeToFit={true}>{enviando ? 'Cadastrando…' : 'Cadastrar'}</Text>
        </TouchableOpacity>
      </View>

      {/* Rodapé para Voltar ao Login */}
      <View style={authStyles.containerNext}>
  <Text style={authStyles.textoNormal}adjustsFontSizeToFit={true}>Já tem uma conta? </Text>
  <TouchableOpacity onPress={irParaLogin}>
    <Text style={authStyles.linkNext}adjustsFontSizeToFit={true}>Faça Login</Text>
  </TouchableOpacity>
</View>
    </View>
  );
}
