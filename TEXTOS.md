# Textos no aplicativo nativo

As telas usam components/AppText.js. No Android, ele usa a família nativa
sans-serif e reserva minHeight a partir das linhas informadas por onTextLayout,
incluindo a posição da última linha e o padding inferior. Isso contorna a
diferença entre medição e desenho descrita no
[problema #56402 do React Native](https://github.com/react/react-native/issues/56402).
Não há cálculo de largura por caracteres, espaços extras, fontes baixadas ou
dependências novas. Web e iOS mantêm o Text padrão.

Títulos e rótulos de bloco usam a largura disponível. Textos não têm limite de
linhas ou redução automática da fonte; botões usam minHeight. A escala de fonte
das configurações do aparelho continua habilitada.

Home e formulários permitem rolagem quando o conteúdo cresce. A navbar mantém
as quatro opções e sua altura medida é compartilhada com as telas.

Lint, tipos, testes e exportação Android não comprovam a renderização em um
celular físico. Conferir nele nomes longos, sete etapas, limites dos seletores,
carregamento, abas Dia 1/2/3 e horários, também com fonte ampliada.
