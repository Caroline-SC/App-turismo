# Integração com a API de turismo

Inicie o backend `backend/api_turismo` com `npm run dev` (porta 5000).
Neste frontend, `npm start`. Autenticação usa cookie HTTP-only,
sempre com `credentials: include`. Não armazena senha nem token no dispositivo.

## Endereço e rede

`.env.local` foi ajustado para a porta 5000, mantendo o IP já configurado.
Confira `EXPO_PUBLIC_API_URL`: o IP precisa ser o do computador que executa a API.
Não coloque credenciais nessa variável pública.

- Celular físico: `http://IP_DO_COMPUTADOR:5000`, na mesma rede Wi-Fi;
- Emulador Android: `http://10.0.2.2:5000`;
- Navegador local: `http://localhost:5000`.

Sem variável, o app usa o host do Expo; no navegador usa o hostname da página.
Ao alterar o endereço, recarregue o Expo. Libere a porta 5000 no firewall se
o computador bloquear acesso pelo celular. Use HTTPS em produção.

No navegador, frontend e API precisam usar o mesmo hostname para os cookies:
use localhost em ambos, ou IP em ambos. O backend aceita origens listadas em
`FRONTEND_ORIGINS`, separadas por vírgula. Foram incluídas as origens locais do
Expo e o IP configurado na porta 8081. Reinicie o backend após mudar a variável.

## Fluxos conectados

- Cadastro real: `POST /api/users/register`.
- Login/logout e restauração da sessão: `/api/users/login`, `/logout`, `/check`.
- Perfil/preferências: `PUT /api/users/profile`; seleção salva imediatamente.
- Home e Explorar: `GET /api/pontos?resumo=true`; hist?rico completo s? ? buscado no detalhe.
- Detalhe atualizado: `GET /api/pontos/:id`.
- Favoritos: `GET /api/users/favoritos` e `POST /api/users/favoritos/:pontoId`.
- Roteiro: `POST /api/roteiros`; formulário converte nomes em IDs reais e
  interesses em categorias reconhecidas pelo modelo. Não permite inventar um
  ponto fora da base nem gerar para outra cidade: a base atual é Salvador.
- Salvos: `GET /api/roteiros` (50 mais recentes). Toque no card para buscar
  `GET /api/roteiros/:id` e preencher os horários por dia no próprio card.
  Segure o card para confirmar `DELETE /api/roteiros/:id`.

As telas não tinham campos de pessoas, transporte ou restaurantes. Para manter
o visual, a criação usa uma pessoa e caminhada, sem restaurante confirmado.
Não foram adicionados campos. O backend retorna avisos sobre preços desconhecidos,
restaurantes a definir e deslocamentos estimados; toque no roteiro para vê-los.
O indicador “Visitados” permanece vazio: a API não tem esse recurso.

Estilos, cores, dimensões, fontes e barra de navegação foram preservados.
A navegação interna usa Expo Router, conforme AGENTS.md, sem cabeçalhos extras.
No Android/iOS o mapa continua react-native-maps e mostra os pontos da API.
No navegador, onde react-native-maps não funciona, um mapa OSM ocupa a mesma
área (mostra a região e um marcador). Não consulta localização GPS do usuário.

Erros são apresentados sem fabricar dados; botões de envio são bloqueados
durante a chamada. Geração tem timeout de cinco minutos para acomodar Python e
roteamento. Após timeout, consulte Salvos antes de reenviar, pois o servidor
pode ter concluído o pedido. Falha de geração nunca cria card falso.

## Verificações

`npm test`: contratos de campos, cookies, sessão expirada, erros e adaptadores.
`npm run lint` e `npm run typecheck`: análise estática.
Os testes do cliente simulam HTTP; não gravam usuários nem roteiros no MongoDB.
Não houve validação manual em um celular físico.

## Otimiza??o e diagn?stico de conex?o

Telas e mapa s?o avaliados sob demanda, imports de ?cones usam somente Ionicons. O mapa memoiza marcadores e limita a 60 na regi?o vis?vel; os demais aparecem ao mover o mapa. Favoritos s?o derivados dos IDs da sess?o e do cat?logo, sem um segundo download de todas as atra??es. Estilos foram mantidos. N?o h? benchmark em celular f?sico.

O backend usa node --use-system-ca para os certificados confi?veis do Windows, preservando verifica??o TLS. GET /api/health retorna database=connected quando est? acess?vel. Foi testado no IP Wi-Fi 192.168.1.110:5000 e no loopback. Backend e Expo s?o processos separados: mantenha o backend ativo com npm run dev. A pasta atual do backend ? backend/api_turismo.
