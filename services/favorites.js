export function alterarIdsFavoritos(ids, id, favoritado) {
  const unicos = [...new Set((ids || []).filter(valor => typeof valor === 'string'))];
  return favoritado ? [...new Set([...unicos, id])] : unicos.filter(valor => valor !== id);
}
export function favoritosDoUsuario(ids, catalogo, detalhes = []) {
  const locais = new Map([...detalhes, ...catalogo].map(p => [p.id, p]));
  return [...new Set((ids || []).filter(id => typeof id === 'string'))].map(id => locais.get(id) || {
    id, nome: 'Local indisponível', bairro: 'Atualize o perfil para consultar este favorito.', indisponivel: true,
  });
}
