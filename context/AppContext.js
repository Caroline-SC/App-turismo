import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api, onSessionExpired } from '../services/api';
import '../services/runtimeApi';
import { adaptarPonto } from '../services/adapters';
import { alterarIdsFavoritos, favoritosDoUsuario } from '../services/favorites';
import { avisar } from '../services/notify';

const AppContext = createContext(null);
export function AppProvider({ children }) {
  const [user, setUser] = useState(null), [verificando, setVerificando] = useState(true);
  const [pontos, setPontos] = useState([]);
  const [alturaNavbar, setAlturaNavbar] = useState(0);
  const medirNavbar = useCallback(altura => setAlturaNavbar(atual => Math.abs(atual - altura) > 1 ? altura : atual), []);
  const [favoritosDados, setFavoritosDados] = useState({ usuario: null, pontos: [] });
  const [visitados, setVisitados] = useState([]);
  const [carregandoPerfil, setCarregandoPerfil] = useState(false), [erroPerfil, setErroPerfil] = useState('');
  const userId = user?.id || user?._id;
  const favoritos = useMemo(() => favoritosDoUsuario(user?.favoritos, pontos, favoritosDados.usuario === userId ? favoritosDados.pontos : []), [pontos, user?.favoritos, favoritosDados, userId]);
  const [carregandoPontos, setCarregandoPontos] = useState(true), [erroPontos, setErroPontos] = useState('');
  const sessao = useRef(0), locks = useRef(new Set());
  const ultimaCarga = useRef(0), cargaPendente = useRef(null), perfilPendente = useRef(null), revisaoPerfil = useRef(0);
  const limpar = useCallback(() => {
    sessao.current++; revisaoPerfil.current++; ultimaCarga.current = 0; cargaPendente.current = null; perfilPendente.current = null;
    setUser(null); setPontos([]); setFavoritosDados({ usuario: null, pontos: [] }); setVisitados([]); setCarregandoPerfil(false); setErroPerfil('');
  }, []);
  useEffect(() => {
    let ativo = true;
    const unsubscribe = onSessionExpired(limpar);
    api.check().then(r => { if (ativo && r.isLoggedIn) setUser(r.user); }).catch(err => { if (ativo) avisar('Conexão', err.message); }).finally(() => { if (ativo) setVerificando(false); });
    return () => { ativo = false; unsubscribe(); };
  }, [limpar]);
  const carregarPontos = useCallback(async () => {
    const versao = sessao.current;
    if (cargaPendente.current?.versao === versao) return cargaPendente.current.promise;
    const carga = { versao, promise: null };
    cargaPendente.current = carga;
    carga.promise = (async () => {
      setCarregandoPontos(true); setErroPontos('');
      try { const r = await api.pontos(); if (versao === sessao.current) { setPontos(r.pontos.map(adaptarPonto)); ultimaCarga.current = Date.now(); } }
      catch (err) { if (versao === sessao.current) setErroPontos(err.message); }
      finally { if (cargaPendente.current === carga) cargaPendente.current = null; if (versao === sessao.current) setCarregandoPontos(false); }
    })();
    return carga.promise;
  }, []);
  const atualizarCatalogo = useCallback(() => { if (Date.now() - ultimaCarga.current > 60000) carregarPontos(); }, [carregarPontos]);
  useEffect(() => {
    if (!userId) return;
    let ativo = true;
    Promise.resolve().then(() => { if (ativo) carregarPontos(); });
    return () => { ativo = false; };
  }, [userId, carregarPontos]);
  const carregarPerfil = useCallback(async () => {
    if (!userId) return;
    if (perfilPendente.current?.usuario === userId) return perfilPendente.current.promise;
    const versao = sessao.current, revisao = revisaoPerfil.current, carga = { usuario: userId, promise: null };
    perfilPendente.current = carga;
    carga.promise = (async () => {
      setCarregandoPerfil(true); setErroPerfil('');
      try {
        const [perfil, lista] = await Promise.all([api.profile(), api.favoritos()]);
        if (versao !== sessao.current) return;
        setVisitados(perfil.visitados || []);
        setFavoritosDados({ usuario: userId, pontos: (lista.favoritos || []).map(adaptarPonto) });
        if (revisao === revisaoPerfil.current) setUser(atual => atual ? { ...atual, ...perfil.user, favoritos: lista.ids || perfil.user.favoritos || [] } : atual);
      } catch (err) { if (versao === sessao.current) setErroPerfil(err.message); }
      finally { if (perfilPendente.current === carga) perfilPendente.current = null; if (versao === sessao.current) setCarregandoPerfil(false); }
    })();
    return carga.promise;
  }, [userId]);
  const login = async (email, senha) => { const r = await api.login(email, senha); limpar(); setCarregandoPontos(true); setErroPontos(''); setUser(r.user); };
  const logout = async () => { await api.logout(); limpar(); };
  const alternarFavorito = async (id, desejado) => {
    const chave = `${sessao.current}:${id}`;
    if (!user || locks.current.has(chave)) return;
    locks.current.add(chave); revisaoPerfil.current++;
    const versao = sessao.current;
    try {
      const favoritado = typeof desejado === 'boolean' ? desejado : !(user.favoritos || []).includes(id);
      const r = await api.definirFavorito(id, favoritado);
      if (versao === sessao.current) {
        revisaoPerfil.current++;
        // Aplica apenas a mudança deste ponto: respostas de outros pontos podem chegar fora de ordem.
        setUser(atual => atual ? { ...atual, favoritos: alterarIdsFavoritos(atual.favoritos, id, r.favoritado) } : atual);
      }
    } finally { locks.current.delete(chave); }
  };
  const salvarInteresses = async interesses => {
    const versao = sessao.current;
    revisaoPerfil.current++;
    const r = await api.updateProfile({ interesses });
    if (versao === sessao.current) {
      revisaoPerfil.current++;
      setUser(atual => atual ? { ...atual, name: r.user.name, email: r.user.email, interesses: r.user.interesses } : atual);
    }
  };
  return <AppContext.Provider value={{ user, verificando, login, logout, pontos, favoritos, visitados, carregandoPontos, erroPontos, carregarPontos, atualizarCatalogo, alternarFavorito, salvarInteresses, carregarPerfil, carregandoPerfil, erroPerfil, alturaNavbar, medirNavbar }}>{children}</AppContext.Provider>;
}
export const useApp = () => useContext(AppContext);
