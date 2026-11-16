import * as Location from 'expo-location';
import { criarLocalizador } from './locationCore';
const obter = criarLocalizador(Location);
let pendente = null;
export function localizar(solicitarNovamente = false) {
  if (!pendente) pendente = obter(solicitarNovamente).finally(() => { pendente = null; });
  return pendente;
}
