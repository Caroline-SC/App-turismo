# Criação de roteiros por etapas

O formulário preserva respostas ao avançar e voltar entre sete etapas:
destino, interesses, pontos opcionais, horários, pessoas, transporte e dias.

Na última etapa, o usuário pode dar um nome ao roteiro com até 120 caracteres.
Se deixar em branco, o nome será “Passeio em Salvador”. O campo nome segue para
a API, é salvo com o usuário da sessão e aparece nos cards de Meus roteiros e
no detalhe. O resumo e o seletor de dias continuam nessa etapa.

Gerar roteiro bloqueia envios duplicados e mostra “Criando roteiro…” até a API
responder. Em caso de erro, as respostas continuam preenchidas. A navbar
existente permanece e fica sem interação durante a geração.

A pausa de restaurante só é planejada se a janela diária cruza 12h–13h.
Manhãs que terminam às 12h e tardes a partir das 13h ficam sem essa pausa;
o resumo do dia só indica almoço quando ele existe.

A recuperação de senha foi removida: tela, link do login, chamadas, endpoints,
serviços de e-mail, configuração SMTP e dependência de envio. Login, cadastro,
perfil e favoritos continuam disponíveis. A validação das sessões foi mantida.

Validação: npm test, npm run lint, npm run typecheck e exportação Android.
Os testes verificam o nome escolhido e seus limites, parâmetros do formulário,
horários e persistência do roteiro no usuário correto.
