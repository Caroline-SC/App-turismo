import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home.js';
import Explore from './components/Explore';
import PlaceDetail from './components/PlaceDetail';

function Conteudo() {
  const [logado, setLogado] = useState(true);
  const [telaAtual, setTelaAtual] = useState('login');
  const [abaAtiva, setAbaAtiva] = useState('home');
  const [localAberto, setLocalAberto] = useState(null);

  // Troca de aba e fecha os detalhes do local, se estiverem abertos
  const mudarAba = (aba) => {
    setLocalAberto(null);
    setAbaAtiva(aba);
  };

  if (logado) {
    if (abaAtiva === 'explore') {
      if (localAberto) {
        return (
          <PlaceDetail
            local={localAberto}
            aoVoltar={() => setLocalAberto(null)}
            aoMudarAba={mudarAba}
          />
        );
      }

      return <Explore aoMudarAba={mudarAba} aoAbrirLocal={setLocalAberto} />;
    }

    return <Home aoSair={() => {}} aoMudarAba={mudarAba} />;
  }

  if (telaAtual === 'login') {
    return (
      <Login
        aoLogar={() => setLogado(true)}
        irParaCadastro={() => setTelaAtual('cadastro')}
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

export default function App() {
  return (
    <SafeAreaProvider>
      <Conteudo />
    </SafeAreaProvider>
  );
}