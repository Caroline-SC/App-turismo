# Inicialização do Expo no Windows

Na pasta `project-app`, execute `npm start`. Também é possível usar `npx expo start`.

A configuração do Metro mantém a correção de leitura dos arquivos do OneDrive e
evita o timeout `Failed to start watch mode` no SDK 58. No Windows, o watcher
acompanha os arquivos do aplicativo e deixa de percorrer `node_modules` para
monitorar alterações. As dependências continuam disponíveis para resolução e
compilação. Após instalar, atualizar ou editar uma dependência, reinicie o Expo.

Saídas em `dist`, `coverage`, `.git` e exportações locais de teste não entram na
varredura. Os arquivos gerados de entrada do Expo, as rotas, os componentes, as
imagens e os demais fontes continuam disponíveis.

O ajuste é carregado por `metro.config.js`, fica limitado ao projeto e ao Windows
e não modifica os arquivos instalados em `node_modules`. Ao atualizar o SDK,
revise a compatibilidade com `FallbackWatcher` de `@expo/metro-file-map`.

Teste de regressão: `node --test tests/metro.test.mjs`. Além dos testes de escopo
e exclusão, há um teste com o watcher real para criação, edição e exclusão de
arquivos temporários.
