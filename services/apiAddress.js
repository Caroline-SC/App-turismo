// Função pura para testar a seleção de host sem carregar React Native.
export function resolverEndereco({ configurado, plataforma, hostname, hostExpo }) {
  if (configurado && configurado.trim() !== 'auto') return configurado.trim();
  if (plataforma === 'web') return `http://${hostname || 'localhost'}:5000`;
  if (hostExpo) {
    const host = new URL(hostExpo.includes('://') ? hostExpo : `http://${hostExpo}`).hostname;
    // Túneis do Expo não expõem o backend; não enviar cookies a esse domínio.
    if (host === 'localhost' || host === '127.0.0.1') return `http://${plataforma === 'android' ? '10.0.2.2' : 'localhost'}:5000`;
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(host) || host.endsWith('.local')) return `http://${host}:5000`;
  }
  throw new Error('Não foi possível descobrir a API. Inicie o Expo em modo LAN ou configure EXPO_PUBLIC_API_URL com o IP do computador.');
}
