import { useState } from 'react';
import Login from './components/Login'; 
import Register from './components/Register'; 
import Home from './components/Home.js'



export default function App() {
  const [logado, setLogado] = useState(false);
  const [telaAtual, setTelaAtual] = useState('login'); 

  if (logado) {
    return (
      <Home aoSair={()=> {}}/>
    );
  }

  if (telaAtual === 'login') {
    return (
      <Login 
        aoLogar={() => setLogado(true)} 
        irParaCadastro={() => setTelaAtual('cadastro')} // Função simples para mudar de tela
      />
    );
  } else {
    return (
      <Register
        aoCadastrar={() => {
          alert('Cadastro realizado!');
          setTelaAtual('login'); 
        }} 
        irParaLogin={() => setTelaAtual('login')} 
      />
    );
  }
}
