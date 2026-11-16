import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { api } from '../services/api';
import { progressoDoRoteiro } from '../services/trip';

export function useTrip(id) {
  const [resultado, setResultado] = useState(null), [tentativa, setTentativa] = useState(0);
  const [salvando, setSalvando] = useState(false), [erroAcao, setErroAcao] = useState('');
  const trava = useRef(false);
  useFocusEffect(useCallback(() => {
    if (typeof id !== 'string') return;
    let ativo = true;
    api.roteiro(id).then(r => {
      if (!r.roteiro?.plano?.dias?.length || r.roteiro.plano.dias.some(d => !d.paradas?.length)) throw new Error('Este roteiro não tem visitas disponíveis. Crie um novo roteiro.');
      if (ativo) setResultado({ id, roteiro: r.roteiro, erro: '', tentativa });
    })
      .catch(err => { if (ativo) setResultado({ id, roteiro: null, erro: err.message, tentativa }); });
    return () => { ativo = false; };
  }, [id, tentativa]));
  const atual = resultado?.id === id ? resultado : null;
  const roteiro = atual?.roteiro;
  const executar = async (acao, dados = {}) => {
    if (!roteiro || trava.current) return null;
    trava.current = true; setSalvando(true); setErroAcao('');
    try {
      const r = await api.progressoRoteiro(id, { acao, versao: progressoDoRoteiro(roteiro).versao, ...dados });
      setResultado(anterior => anterior?.id === id ? { ...anterior, roteiro: { ...anterior.roteiro, progresso: r.progresso } } : anterior);
      return r.progresso;
    } catch (err) { setErroAcao(err.message); if (err.status === 409) setTentativa(t => t + 1); throw err; }
    finally { trava.current = false; setSalvando(false); }
  };
  return { roteiro, erro: atual?.erro || '', erroAcao, carregando: !atual || (!roteiro && atual.tentativa !== tentativa), salvando, executar, tentar: () => setTentativa(t => t + 1) };
}
