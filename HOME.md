# Home: mapa, fotos e proximidade

A Home usa mapa claro, pins e controles no azul Citour `#0097b2`, painel inferior
azul gelo, saudação e carrossel de fotos dos pontos da API. A navbar existente
permanece sem alterações. Cards abrem os detalhes do ponto; “Ver todos” abre
Explorar. O carrossel mostra até 12 destinos, permite arrastar e avança sozinho.

Na primeira abertura, solicita localização **somente em primeiro plano**.
Com permissão, centraliza o mapa e ordena os pontos pela distância em linha reta
até o usuário. Não são distâncias por ruas nem tempos de caminhada. O botão
de alvo atualiza a posição e centraliza novamente. Ao voltar das configurações
do aparelho, o app consulta a permissão outra vez.

Se a permissão for negada, se o GPS estiver desligado ou indisponível, mantém
os pontos de Salvador disponíveis. Não inventa uma localização para o usuário.
Se a permissão estiver bloqueada, o botão abre as configurações do aplicativo.
Não solicita localização em segundo plano, não mantém um watcher de GPS e não
envia as coordenadas ao backend; usa-as localmente para ordenar o catálogo.
Reaproveita uma posição recente por até um minuto; atualizar manualmente busca
uma nova posição.

As fotos vêm de `imagemUrl` (coluna `imagem_url` da planilha). Miniaturas são
usadas para URLs diretas do Wikimedia, reduzindo o download. URL ausente ou
imagem inválida mostra um fundo de reserva, mantendo o ponto acessível.

O mapa nativo mantém limite de 60 marcadores na região visível. O tratamento
visual claro usa customMapStyle no Google Maps e interface clara no Apple Maps.
No navegador permanece o mapa incorporado OpenStreetMap; a aparência e os
recursos do mapa são diferentes dos controles nativos Android/iOS.

Instalação: `expo-location` na versão compatível com SDK 58. Reinicie o Expo
depois de instalar. No Expo Go compatível, o módulo é incluído. Se usar um
development build próprio, reconstrua-o com EAS para incluir o módulo e a nova
descrição de permissão do app.json.

Validação automatizada cobre ordenação, coordenadas ausentes, permissões,
GPS desligado, cache e atualização manual. A permissão real e o comportamento
do mapa/GPS precisam ser conferidos em um aparelho físico.
