export function alturaDoTexto(linhas, paddingInferior = 0) {
  if (!Array.isArray(linhas) || !linhas.length) return 0;
  const fundos = linhas.filter(linha => Number.isFinite(linha.y) && Number.isFinite(linha.height) && linha.height > 0)
    .map(linha => linha.y + linha.height);
  if (!fundos.length) return 0;
  return Math.ceil(Math.max(...fundos) + (Number(paddingInferior) || 0)) + 1;
}
