import { useState } from 'react';
import Login from './components/Login'; 
import Register from './components/Register'; 


export default function App() {
  const [logado, setLogado] = useState(false);
  const [telaAtual, setTelaAtual] = useState('login'); 

  if (logado) {
    return (
      alert('Login realizado com')
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
