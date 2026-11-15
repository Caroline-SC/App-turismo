export class ApiError extends Error {
  constructor(message, status = 0) { super(message); this.status = status; }
}

export function createApiClient({ baseUrl, fetchImpl = (url, options) => fetch(url, options), onUnauthorized = () => {} }) {
  let base = baseUrl.replace(/\/$/, '').replace(/\/api$/, '');
  let configurationError = '';
  /** @param {string} path @param {{method?: string, body?: unknown, timeout?: number, auth?: boolean}} options */
  async function request(path, { method = 'GET', body, timeout = 20000, auth = true } = {}) {
    if (configurationError) throw new ApiError(configurationError);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetchImpl(`${base}/api${path}`, {
        method, credentials: 'include', signal: controller.signal,
        headers: { Accept: 'application/json', ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      });
      const data = await response.json().catch(() => null);
      if (response.status === 401 && auth) onUnauthorized();
      if (!response.ok || data?.success === false) throw new ApiError(data?.details?.join('\n') || data?.error || `Falha na API (HTTP ${response.status}).`, response.status);
      if (!data) throw new ApiError('A API não retornou JSON válido.', response.status);
      return data;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      if (err.name === 'AbortError') throw new ApiError('A API demorou para responder. Verifique sua conexão e consulte os roteiros salvos antes de gerar novamente.');
      throw new ApiError(`Não foi possível conectar à API em ${base}. Inicie o backend na porta 5000 e confira se celular e computador estão na mesma rede Wi-Fi.`);
    } finally { clearTimeout(timer); }
  }
  return {
    setBaseUrl: url => { base = url.replace(/\/$/, '').replace(/\/api$/, ''); },
    setConnectionError: message => { configurationError = message; },
    login: (email, senha) => request('/users/login', { method: 'POST', body: { email: email.trim().toLowerCase(), password_hash: senha }, auth: false }),
    register: (nome, email, senha) => request('/users/register', { method: 'POST', body: { name: nome.trim(), email: email.trim().toLowerCase(), password_hash: senha }, auth: false }),
    check: () => request('/users/check', { auth: false, timeout: 5000 }),
    logout: () => request('/users/logout', { method: 'POST' }),
    profile: () => request('/users/profile'),
    updateProfile: body => request('/users/profile', { method: 'PUT', body }),
    pontos: (busca = '') => request(`/pontos?resumo=true${busca ? `&busca=${encodeURIComponent(busca)}` : ''}`, { auth: false }),
    ponto: id => request(`/pontos/${encodeURIComponent(id)}`, { auth: false }),
    favoritos: () => request('/users/favoritos'),
    toggleFavorito: id => request(`/users/favoritos/${encodeURIComponent(id)}`, { method: 'POST' }),
    roteiros: (pagina = 1) => request(`/roteiros?pagina=${pagina}&limite=50`),
    roteiro: id => request(`/roteiros/${encodeURIComponent(id)}`),
    criarRoteiro: body => request('/roteiros', { method: 'POST', body, timeout: 300000 }),
    excluirRoteiro: id => request(`/roteiros/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  };
}

let unauthorized = () => {};
export const onSessionExpired = listener => { unauthorized = listener; return () => { unauthorized = () => {}; }; };
export const api = createApiClient({ baseUrl: process.env.EXPO_PUBLIC_API_URL && process.env.EXPO_PUBLIC_API_URL !== 'auto' ? process.env.EXPO_PUBLIC_API_URL : 'http://localhost:5000', onUnauthorized: () => unauthorized() });
