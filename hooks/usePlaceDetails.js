import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { adaptarPonto } from '../services/adapters';

export function usePlaceDetails(id, inicial) {
  const [resultado, setResultado] = useState(null);
  const [tentativa, setTentativa] = useState(0);
  useEffect(() => {
    if (!id) return;
    let ativo = true;
    api.ponto(id).then(r => { if (ativo) setResultado({ id, tentativa, ponto: adaptarPonto(r.ponto), erro: '' }); })
      .catch(err => { if (ativo) setResultado({ id, tentativa, ponto: null, erro: err.message }); });
    return () => { ativo = false; };
  }, [id, tentativa, inicial?.imagemUrl]);
  const atual = resultado?.id === id && resultado?.tentativa === tentativa ? resultado : null;
  return { ponto: atual?.ponto || inicial, carregando: Boolean(id && !atual), erro: atual?.erro || '', tentarNovamente: () => setTentativa(t => t + 1) };
}
