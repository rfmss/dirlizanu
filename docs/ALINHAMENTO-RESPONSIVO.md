# Alinhamento e centralização responsiva

Este documento registra o refinamento feito após a inspeção visual do tabuleiro em navegador desktop.

## Sintoma observado

O tabuleiro interno e o chassi azul pareciam deslocados, sobretudo nas bordas direita e inferior. O erro não estava na matriz das peças: estava no modelo de caixa do contêiner.

## Causa

`game.js` mede a área disponível e atribui o mesmo tamanho quadrado ao tabuleiro e, historicamente, ao elemento externo `boardShell`.

O chassi externo também possui:

- padding;
- borda;
- marcas de registro;
- sombra física.

Como o sistema visual aplica `box-sizing: border-box`, repetir no chassi a largura do tabuleiro fazia conteúdo, padding e borda disputarem a mesma medida. O resultado visual era um quadro interno que não ocupava o centro matemático do chassi.

## Regra corrigida

O tabuleiro interno continua sendo a única medida calculada pelo motor do jogo.

O chassi passa a usar largura intrínseca:

```css
#screen-game .board-shell {
  width: max-content !important;
  justify-self: center;
}
```

A área de medição reserva o espaço consumido pelo frame:

```css
#screen-game .board-area {
  width: min(
    calc(100% - var(--dz-frame-extra)),
    max(250px, calc(100dvh - 270px))
  );
  margin-inline: auto;
}
```

Assim:

1. `game.js` mede a área útil;
2. cria o quadrado interno;
3. o chassi envolve esse quadrado;
4. padding e bordas crescem para fora, de modo simétrico;
5. a composição permanece centralizada.

## Centro relativo ao dispositivo

A tela do jogo usa o visual viewport como referência:

```css
#screen-game.active {
  display: grid;
  min-height: 100dvh;
  place-items: safe center;
}
```

`100dvh` responde à área realmente visível quando barras do navegador aparecem ou desaparecem. Há fallback para `100svh` e `100vh`.

O modificador `safe` mantém a centralização sempre que o conteúdo cabe e evita que controles se tornem inacessíveis quando a tela é menor que o conjunto mínimo do jogo.

## Responsividade bidimensional

O tamanho do tabuleiro não depende apenas da largura. Ele é limitado simultaneamente por:

- largura do aparelho;
- altura visível do navegador;
- áreas seguras;
- cabeçalho, comandos e instruções;
- tamanho mínimo útil para toque.

Em telas baixas, o sistema remove primeiro informações secundárias:

- registro lateral da máquina;
- rodapé técnico;
- dica repetida;
- subtítulos de comando em paisagem extrema.

O tabuleiro é reduzido apenas depois dessa subtração.

## Breakpoints de altura

### Até 660 px

- chrome vertical compactado;
- metadados secundários ocultos;
- comandos mais baixos;
- tabuleiro calculado por `100dvh - 218px`.

### Até 500 px em paisagem

- cabeçalho interno da máquina oculto;
- comandos distribuídos em três colunas;
- tabuleiro calculado por `100dvh - 178px`.

## Invariantes para manutenção

Não reintroduzir:

- largura fixa idêntica no tabuleiro e no chassi;
- centralização baseada apenas em `margin: auto`;
- dimensionamento que considere somente `vw`;
- transformação `scale()` no chassi durante o jogo;
- medidas de arraste diferentes das medidas visuais do tabuleiro.

Qualquer alteração futura deve manter:

```text
centro do tabuleiro = centro do chassi = centro da máquina = centro visual do dispositivo
```

## Arquivos envolvidos

- `responsive-centering.css`: geometria e breakpoints bidimensionais;
- `index.html`: carrega a camada depois de `refinement.css`;
- `game.js`: permanece sem alteração nesta correção.

## Validação recomendada

Testar ao menos:

- 320 × 568;
- 360 × 640;
- 375 × 667;
- 390 × 844;
- 430 × 932;
- 568 × 320 em paisagem;
- 667 × 375 em paisagem;
- 768 × 1024;
- 1366 × 768;
- alteração de orientação com um arraste em andamento;
- navegador móvel com barras visíveis e recolhidas.
