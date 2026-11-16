# Roteiros e acompanhamento

- A criação envia dias (1–14), pessoas (1–100), horários, interesses, transporte e IDs obrigatórios para a API existente com Python.
- Meus roteiros usa resumos pequenos, em cards azuis. O plano completo é buscado quando o usuário abre um card.
- A linha do tempo separa dias, visitas, deslocamentos, espera e almoço. O botão Iniciar/Continuar abre `/trip/[id]/navigate`.
- O progresso pertence ao usuário da sessão. É salvo no MongoDB e pode ser retomado depois de sair ou recarregar o aplicativo.

## API

`PATCH /api/roteiros/:id/progresso`

```json
{ "acao": "iniciar", "dia": 0, "versao": 0 }
```

Ações: iniciar, reiniciar, chegar, proximo, pausar e retomar. Dias e paradas usam índices a partir de zero. A versão deve ser a última devolvida pela API; conflitos retornam 409. Chegada por GPS inclui `origem`; a confirmação manual usa `manual: true`. A API determina qual é a parada atual e impede avançar antes de registrar a chegada.

`POST /api/roteiros/:id/trajeto`

```json
{ "dia": 0, "parada": 0, "origem": { "latitude": -12.9745, "longitude": -38.5100 } }
```

Destino e transporte são obtidos do plano do dono autenticado. A resposta inclui geometria GeoJSON, distâncias, duração e manobras. Não há linha de ruas inventada se o provedor falhar; o usuário pode tentar novamente ou abrir o Google Maps.

## GPS e mapa

O GPS funciona somente com a navegação em primeiro plano e para ao pausar, mudar de tela ou colocar o app em segundo plano. A chegada automática exige duas leituras distintas, recentes, com precisão de até 40 m e distância de até 45 m. Existe confirmação manual para casos de GPS impreciso. O tempo de permanência é calculado a partir da chegada real, com a duração de grupo já definida no plano.

O almoço sem restaurante cadastrado é identificado como uma região, não como um estabelecimento confirmado: o usuário escolhe onde comer e confirma sua chegada manualmente.

Rotas de rua usam OSRM/FOSSGIS, com cache, deduplicação e fila limitada a uma consulta por segundo. Para hospedar um serviço próprio, configure no backend `NAVIGATION_FOOT_URL` e `NAVIGATION_CAR_URL` com a base da instância OSRM adequada ao transporte. As instâncias públicas são para uso leve, sem garantia de disponibilidade. Política: https://routing.openstreetmap.de/about.html

No Android/iOS o mapa usa react-native-maps. No navegador, `public/route-map.html` usa Leaflet 1.9.4 e tiles OpenStreetMap, carregados apenas ao abrir a navegação. As atribuições e o link para corrigir o mapa ficam visíveis.

## Fotos

O app aceita URLs de `upload.wikimedia.org` e `thumb.wikimedia.org`, remove parâmetros de rastreamento dessas URLs e usa miniaturas de tamanhos aceitos (500 px nos cards e 960 px no destaque). A versão anterior gerava 640 px, que a Wikimedia responde com HTTP 400. Há tentativa alternativa de host e recarga manual em caso de erro. URLs de outros provedores mantêm seus parâmetros.

O catálogo da planilha tem cache de um minuto na API. Home e Explorar atualizam o catálogo ao receber foco, com intervalo mínimo de um minuto. O botão de atualizar da Home também permite buscar o catálogo. Pontos sem uma URL real continuam mostrando a indicação de foto não cadastrada.

## Verificação

O perfil recarrega a conta e seus favoritos ao receber foco. A lista usa `GET /api/users/favoritos?resumo=true`; salvar/remover usa `PUT /api/users/favoritos/:pontoId` com `{ "favoritado": true }` ou `false`. Somente a sessão define qual usuário é alterado. O POST antigo de alternância continua disponível para compatibilidade. Contadores de visitas usam as paradas registradas nos roteiros do próprio usuário. Categorias e preferências são exibidas com rótulos completos, e preferências adicionais da conta são preservadas.

Frontend: `npm test`, `npm run lint`, `npm run typecheck` e `expo export --platform android`.
Backend: `npm test -- --test-concurrency=2`.

Os testes simulam GPS, concorrência e autenticação. A precisão de chegada em movimento e os mapas nativos ainda precisam de validação em aparelho físico.
