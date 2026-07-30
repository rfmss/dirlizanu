# Sistema de áudio do Dirlizanu

## Objetivo

O áudio deve confirmar uma ação sem competir com o tabuleiro, mascarar outros sons do dispositivo ou formar uma pilha de cliques durante movimentos rápidos.

A implementação não promete efeitos “neurocientíficos”. Ela aplica critérios conservadores usados em interfaces e jogos:

- eventos muito curtos;
- volume baixo;
- ataque suavizado;
- redução de energia aguda;
- ausência de reverberação longa;
- uma única voz ativa por vez;
- controle explícito para desligar o som.

## Referência auditada

A linguagem de microsons foi comparada com o repositório público:

- `Calinou/kenney-ui-audio`
- pacote original de Kenney
- licença CC0 1.0 Universal
- cerca de cinquenta sons de interface, botões e switches

O projeto não copia nem carrega arquivos remotos. O pacote serviu como referência de duração, secura e escala. Os sons enviados pelo Dirlizanu continuam sintetizados no próprio navegador para preservar:

- funcionamento offline;
- carregamento imediato;
- tamanho mínimo;
- ausência de pedidos de rede;
- comportamento igual em todas as fases.

## Arquitetura

`audio-engine.js` é carregado antes de `game.js`.

Ele mantém a pequena API de Web Audio já usada pelo jogo, mas adiciona uma cadeia de conforto:

1. oscilador senoidal;
2. filtro passa-baixas em aproximadamente 4,3 kHz;
3. compressor com ataque curto;
4. ganho mestre reduzido;
5. saída do dispositivo.

## Regra de voz única

Quando uma nova indicação começa:

1. a voz anterior tem automações futuras canceladas;
2. seu ganho desce até quase zero em 7 ms;
3. o oscilador anterior é encerrado em 11 ms;
4. a nova voz assume o canal.

Essa política é chamada de `voice stealing`. Ela impede que taps, slides e comandos rápidos se acumulem.

Na vitória, as notas continuam formando uma sequência, mas cada nota entrega o canal à seguinte. O resultado é um pequeno percurso melódico, não um acorde sobreposto.

## Eventos

- `playPress`: confirmação curta do contato com a peça;
- `playSlide`: confirmação do deslocamento;
- `playButton`: comando de interface;
- `playWin`: sequência de conclusão, com uma nota adicional quando o selo é conquistado.

## Persistência e acessibilidade

A preferência continua armazenada em `dz_audio`.

O botão informa o estado por texto e `aria-pressed`. Som nunca é a única forma de comunicar uma ação.

## Manutenção

Não adicione sons longos ao canal de interface.

Não crie um novo `AudioContext` por evento.

Não remova a política de voz única para produzir “mais impacto”. Se uma futura trilha ou ambiência for adicionada, ela deverá usar outro barramento, com controle independente e ducking documentado.
