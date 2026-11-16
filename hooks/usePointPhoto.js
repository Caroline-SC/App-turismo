import { useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { fotosDoPonto, fonteFoto } from '../services/nearby';

export function usePointPhoto(url, largura = 500) {
  const candidatos = useMemo(() => fotosDoPonto(url, largura), [url, largura]);
  const chave = candidatos.join('|');
  const [estado, setEstado] = useState({ chave: '', indice: 0, versao: 0 });
  const indice = estado.chave === chave ? estado.indice : 0;
  const uri = candidatos[indice] || null;
  const source = useMemo(() => fonteFoto(uri, Platform.OS, estado.versao > 0), [uri, estado.versao]);
  return {
    uri, source, key: `${uri}:${estado.versao}`, falhou: candidatos.length > 0 && !uri,
    aoErro: () => setEstado(atual => {
      const atualIndice = atual.chave === chave ? atual.indice : 0;
      return atualIndice === indice ? { chave, indice: indice + 1, versao: atual.versao } : atual;
    }),
    tentar: () => setEstado(atual => ({ chave, indice: 0, versao: atual.versao + 1 })),
  };
}
