import  { useState } from 'react';
import {Text, View, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { authStyles } from '../styles/authStyles';

export default function Register({ aoCadastrar, irParaLogin }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const verificarCadastro = () => {
    if (nome === '' || email === '' || senha === '' || confirmarSenha === '') {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }

    // Passa os dados para a função de cadastro se tudo estiver correto
    aoCadastrar({ nome, email, senha });
  };

  return (
    <View style={authStyles.container}>
      {/* Topo Azul Estilizado */}
      <View style={authStyles.topoAzul}>
        <View style={authStyles.conatinerLogo}>
          <Image source={require('../assets/logo.png')} style={authStyles.logo} />
          <Text style={authStyles.textoTopo}>Bem vindo ao Citour</Text>
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

        <TouchableOpacity style={authStyles.botaoSubmmit} onPress={verificarCadastro}>
          <Text style={authStyles.textoBotao}>Cadastrar</Text>
        </TouchableOpacity>
      </View>

      {/* Rodapé para Voltar ao Login */}
      <View style={authStyles.containerNext}>
  <Text style={authStyles.textoNormal}>Já tem uma conta? </Text>
  <TouchableOpacity onPress={irParaLogin}>
    <Text style={authStyles.linkNext}>Faça Login</Text>
  </TouchableOpacity>
</View>
    </View>
  );
}
