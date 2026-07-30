# Como implementar o visual RafaMass Blueprint

Este guia ensina a levar a identidade do `dirlizanu` para outro projeto sem copiar o layout do jogo.

## 1. Instale o sistema

Copie:

```text
design-system/rafamass-blueprint.css
```

Carregue antes do CSS da aplicação:

```html
<link rel="stylesheet" href="design-system/rafamass-blueprint.css">
<link rel="stylesheet" href="styles.css">
```

Adicione o escopo:

```html
<body data-rm-blueprint>
```

O atributo pode ficar numa seção quando apenas parte do produto usa essa linguagem.

## 2. Separe identidade de layout

O sistema fornece materiais, tokens e componentes primitivos. Ele não decide a grade do produto.

Transfira:

- papel gessado;
- linhas cyan de construção;
- tinta preta;
- sinal vermilion;
- tipografia técnica;
- sombras deslocadas;
- tensão entre precisão e uma ruptura controlada.

Não transfira automaticamente:

- tabuleiro 4 × 4;
- telas do jogo;
- números 1–15;
- estrutura de menu;
- textos de `dirlizanu`.

## 3. Comece pelos tokens

```css
.meu-produto[data-rm-blueprint] {
  --rm-stage: #171a1d;
  --rm-paper: #f3eee4;
  --rm-ink: #161817;
  --rm-cyan-strong: #36a7d2;
  --rm-vermilion: #ff5a19;
}
```

Evite inserir novos hexadecimais em cada componente. Primeiro verifique se um token existente resolve a necessidade.

## 4. Monte a hierarquia

Ordem recomendada:

1. função principal;
2. estado e dados;
3. comandos;
4. identidade;
5. ornamento.

A decoração deve desaparecer antes da função quando faltar espaço.

## 5. Escolha um objeto principal

Use uma única `.rm-surface` para o artefato central:

```html
<section class="rm-surface painel-principal">
  <span class="rm-kicker">Unidade 01 // ativa</span>
  <h2>Campo de trabalho</h2>
</section>
```

Evite empilhar várias superfícies pesadas. Painéis internos podem usar apenas uma linha cyan ou fundo de papel.

## 6. Organize metadados

```html
<div class="rm-meta-strip metadados">
  <span>Projeto 01</span>
  <span>Salvo</span>
  <span>Local</span>
</div>
```

O CSS do projeto define colunas e divisórias. O sistema define o material.

## 7. Construa comandos reais

```html
<button class="rm-command" type="button">Salvar</button>
```

Não transforme `div` em botão. Preserve foco, teclado, nome acessível e estados `disabled` ou `aria-pressed`.

## 8. Use o sinal uma vez

```html
<button class="rm-command rm-signal" type="button">Publicar</button>
```

Vermilion significa prioridade ou ruptura. Quando tudo é sinal, nada interrompe.

## 9. Crie objetos táteis

```html
<div class="rm-key">7</div>
<div class="rm-key rm-key-signal">15</div>
```

Em objetos arrastáveis:

- anime `transform`, não `top` e `left`;
- use `translate3d`;
- não consulte o DOM em cada `pointermove`;
- agrupe atualizações com `requestAnimationFrame`;
- evite filtro, `clip-path`, blur e imagem animada;
- mantenha a geometria do objeto de sinal igual à dos demais.

A peça 15 de `dirlizanu` segue exatamente essa regra: mesma silhueta e profundidade; a diferença está na superfície e no pequeno registro interno.

## 10. Reserve o dossiê para resultado

```html
<section class="rm-dossier resultado">
  <span class="rm-kicker">Leitura concluída</span>
  <h2>Processo validado.</h2>
</section>
```

Um elemento pode romper o quadro no desktop, mas deve voltar ao fluxo no celular.

## 11. Planeje responsividade por subtração

Em telas estreitas:

- remova metadados secundários;
- empilhe comandos;
- reduza ornamentos;
- mantenha números e ações;
- traga qualquer breakout para dentro do fluxo;
- nunca resolva lotação reduzindo texto essencial abaixo da legibilidade.

## 12. Movimento

Divida animações em três classes:

- mecânica: pressionar, arrastar, soltar;
- editorial: revelar linha ou estado;
- impacto: conclusão.

Impacto não deve ocorrer em cada clique.

Respeite:

```css
@media (prefers-reduced-motion: reduce) {
  /* remova movimentos não essenciais */
}
```

O arquivo oficial já reduz suas próprias transições.

## 13. Checklist de revisão

Antes de publicar, confirme:

- a função aparece antes da decoração;
- existe apenas um sinal dominante por agrupamento;
- não há overflow horizontal em 320 px;
- foco é visível;
- controles são semânticos;
- cyan indica estrutura, não texto corrido;
- metadados pequenos não carregam instrução essencial;
- objetos móveis não usam efeitos caros;
- `prefers-reduced-motion` funciona;
- o produto parece da mesma equipe, não o mesmo layout colado.

## Estrutura recomendada

```text
meu-projeto/
├── design-system/
│   └── rafamass-blueprint.css
├── styles.css
└── index.html
```

## Licença

O sistema está sob licença MIT. Preserve o arquivo `LICENSE` e o aviso de copyright ao redistribuir cópias substanciais.
