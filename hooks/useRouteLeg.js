import { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { coordenadaValida } from '../services/nearby';

export function useRouteLeg(id, dia, parada, coords, ativo) {
  const [resultado, setResultado] = useState(null), [tentativa, setTentativa] = useState(0);
  const origem = useRef(coords);
  useEffect(() => { origem.current = coords; }, [coords]);
  const valido = Boolean(coordenadaValida(coords) && Date.now() - coords.timestamp < 25000);
  const chave = `${id}:${dia}:${parada}`;
  useEffect(() => {
    if (!ativo || !valido) return;
    let atual = true;
    api.trajetoRoteiro(id, { dia, parada, origem: { latitude: origem.current.latitude, longitude: origem.current.longitude } })
      .then(r => { if (atual) setResultado({ chave, tentativa, rota: r.trajeto, erro: '' }); })
      .catch(err => { if (atual) setResultado({ chave, tentativa, rota: null, erro: err.message }); });
    return () => { atual = false; };
  }, [id, dia, parada, chave, ativo, valido, tentativa]);
  const atual = resultado?.chave === chave ? resultado : null;
  return { rota: atual?.rota, erro: atual?.erro || '', carregando: ativo && valido && (!atual || atual.tentativa !== tentativa), recalcular: () => setTentativa(t => t + 1) };
}
