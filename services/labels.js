// Folga para rótulos em linhas com ícones: a medida intrínseca do texto pode
// ficar curta no Android. A largura mínima acompanha também a escala de fonte.
export function larguraRotulo(texto, tamanho, escala = 1, minimo = 0) {
  return Math.ceil(Math.max(minimo, Array.from(String(texto)).length * tamanho * 0.72 + 8) * escala);
}
