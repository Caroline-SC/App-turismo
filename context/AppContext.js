import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api, onSessionExpired } from '../services/api';
import '../services/runtimeApi';
import { adaptarPonto } from '../services/adapters';
import { avisar } from '../services/notify';

const AppContext = createContext(null);
export function AppProvider({ children }) {
  const [user, setUser] = useState(null), [verificando, setVerificando] = useState(true);
  const [pontos, setPontos] = useState([]);
  const favoritos = useMemo(() => pontos.filter(p => user?.favoritos?.includes(p.id)), [pontos, user?.favoritos]);
  const [carregandoPontos, setCarregandoPontos] = useState(true), [erroPontos, setErroPontos] = useState('');
  const sessao = useRef(0), locks = useRef(new Set());
  const limpar = useCallback(() => { sessao.current++; setUser(null); setPontos([]); }, []);
  useEffect(() => {
    let ativo = true;
    const unsubscribe = onSessionExpired(limpar);
    api.check().then(r => { if (ativo && r.isLoggedIn) setUser(r.user); }).catch(err => { if (ativo) avisar('Conexão', err.message); }).finally(() => { if (ativo) setVerificando(false); });
    return () => { ativo = false; unsubscribe(); };
  }, [limpar]);
  const carregarPontos = useCallback(async () => {
    const versao = sessao.current;
    setCarregandoPontos(true); setErroPontos('');
    try { const r = await api.pontos(); if (versao === sessao.current) setPontos(r.pontos.map(adaptarPonto)); }
    catch (err) { if (versao === sessao.current) setErroPontos(err.message); }
    finally { if (versao === sessao.current) setCarregandoPontos(false); }
  }, []);
  const userId = user?.id || user?._id;
  useEffect(() => {
    if (!userId) return;
    let ativo = true;
    api.pontos().then(r => { if (ativo) setPontos(r.pontos.map(adaptarPonto)); })
      .catch(err => { if (ativo) setErroPontos(err.message); })
      .finally(() => { if (ativo) setCarregandoPontos(false); });
    return () => { ativo = false; };
  }, [userId, carregarPontos]);
  const login = async (email, senha) => { const r = await api.login(email, senha); sessao.current++; setCarregandoPontos(true); setErroPontos(''); setUser(r.user); };
  const logout = async () => { await api.logout(); limpar(); };
  const alternarFavorito = async id => {
    if (locks.current.has(id)) return;
    locks.current.add(id);
    const versao = sessao.current;
    try {
      const r = await api.toggleFavorito(id);
      if (versao === sessao.current) {
        setUser(atual => atual ? { ...atual, favoritos: r.favoritos } : atual);
      }
    } finally { locks.current.delete(id); }
  };
  const salvarInteresses = async interesses => {
    const versao = sessao.current;
    const r = await api.updateProfile({ interesses });
    if (versao === sessao.current) setUser(r.user);
  };
  return <AppContext.Provider value={{ user, verificando, login, logout, pontos, favoritos, carregandoPontos, erroPontos, carregarPontos, alternarFavorito, salvarInteresses }}>{children}</AppContext.Provider>;
}
export const useApp = () => useContext(AppContext);
