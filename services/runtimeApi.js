import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { api } from './api';
import { resolverEndereco } from './apiAddress';

// Mantém o endereço configurável para builds e dispositivos físicos.
export function apiAddress() {
  return resolverEndereco({ configurado: process.env.EXPO_PUBLIC_API_URL, plataforma: Platform.OS,
    hostname: Platform.OS === 'web' ? globalThis.location.hostname : undefined,
    hostExpo: Constants.expoConfig?.hostUri });
}
// Configuração ocorre antes das primeiras chamadas do provider.
try { api.setBaseUrl(apiAddress()); }
catch (err) { api.setConnectionError(err.message); }
