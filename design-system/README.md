# RafaMass Blueprint System

Sistema visual editorial, técnico e tátil usado pelo `dirlizanu`.

Licença: MIT.

## O que ele oferece

O arquivo `rafamass-blueprint.css` fornece:

- tokens semânticos de palco, papel, tinta, blueprint e sinal;
- superfícies de papel técnico;
- faixas de metadados;
- comandos mecânicos;
- teclas táteis normais e de sinal;
- dossiês editoriais;
- grade blueprint;
- foco visível;
- preferência por movimento reduzido.

Não inclui:

- reset global;
- fontes externas;
- imagens;
- JavaScript;
- dependências;
- layout de aplicação.

## Instalação

Copie o arquivo para o projeto:

```text
design-system/rafamass-blueprint.css
```

Carregue antes do CSS específico da aplicação:

```html
<link rel="stylesheet" href="design-system/rafamass-blueprint.css">
<link rel="stylesheet" href="styles.css">
```

Aplique o escopo num ancestral:

```html
<body data-rm-blueprint>
  ...
</body>
```

Também é possível limitar o sistema a uma região:

```html
<section data-rm-blueprint>
  ...
</section>
```

## Exemplo mínimo

```html
<section data-rm-blueprint class="rm-surface" style="padding: 24px">
  <span class="rm-kicker">Registro 001 // local</span>
  <h2>Campo de montagem</h2>

  <div class="rm-meta-strip" style="padding: 12px">
    Estado ativo · matriz 4 × 4
  </div>

  <button class="rm-command" type="button">Executar</button>
</section>
```

## Componentes

### `.rm-surface`

Papel técnico com linha cyan, textura pontual e sombra deslocada. Use para o objeto principal da interface. Evite aninhar várias superfícies do mesmo peso.

### `.rm-meta-strip`

Faixa de dados compacta. Funciona melhor com divisões internas, números tabulares e texto monoespaçado.

### `.rm-command`

Controle mecânico com profundidade curta. Deve ser aplicado a `button`, `a` ou outro elemento interativo sem remover sua semântica.

O estado `aria-pressed="false"` recebe tratamento visual próprio.

### `.rm-key`

Bloco tátil neutro. Serve para teclas, amostras, números ou objetos manipuláveis.

### `.rm-key-signal`

Variação vermilion. Use uma vez por agrupamento. O sinal deve indicar prioridade, conclusão ou exceção — nunca decorar todas as peças.

### `.rm-dossier`

Painel de resultado ou decisão. Possui borda de tinta, linha de costura e sombra rígida.

### `.rm-blueprint-grid`

Fundo de construção. Use em áreas grandes e com baixa densidade de conteúdo.

### `.rm-kicker`

Rótulo técnico pequeno. Não use para instruções essenciais.

### `.rm-rule`

Regra editorial preta.

### `.rm-signal`

Superfície sólida vermilion para um estado de impacto.

## Tokens principais

### Fundação

```css
--rm-stage
--rm-stage-deep
--rm-paper
--rm-paper-high
--rm-paper-deep
--rm-ink
--rm-ink-soft
```

### Blueprint

```css
--rm-cyan
--rm-cyan-strong
--rm-cyan-pale
--rm-cyan-grid
```

### Sinais

```css
--rm-vermilion
--rm-vermilion-deep
--rm-red
```

### Estrutura e movimento

```css
--rm-shadow-sm
--rm-shadow-md
--rm-shadow-stage
--rm-radius-object
--rm-radius-key
--rm-radius-control
--rm-motion-fast
--rm-motion-slide
--rm-motion-reveal
--rm-impact-ease
```

## Personalização

Sobrescreva tokens no mesmo elemento que possui `data-rm-blueprint`:

```css
.minha-aplicacao[data-rm-blueprint] {
  --rm-vermilion: #f4511e;
  --rm-cyan-strong: #2a9fc8;
  --rm-radius-object: 18px;
}
```

Não altere os componentes diretamente quando uma troca de token resolve o problema.

## Regras de composição

1. O papel organiza; o palco escuro enquadra.
2. Cyan descreve estrutura, medida ou estado técnico.
3. Vermilion interrompe uma única vez.
4. Preto fecha a hierarquia.
5. Textura permanece abaixo da leitura.
6. Sombra deslocada mostra construção, não luxo.
7. Assimetria entra depois que a grade está correta.
8. Elementos fora do quadro são reservados a conclusão ou insight.

## Erros a evitar

- pintar todos os componentes de laranja;
- usar borda preta grossa em tudo;
- inclinar cada painel;
- misturar blueprint com glassmorphism;
- adicionar ruído sobre texto;
- transformar metadados em microtexto ilegível;
- usar `clip-path`, filtro ou imagem animada em objetos arrastáveis;
- deixar a decoração aparecer antes da função.

## Acessibilidade

O sistema não remove foco nativo sem substituição. Os componentes mantêm alto contraste entre tinta e papel. Elementos interativos continuam dependendo de HTML semântico e nomes acessíveis fornecidos pela aplicação.

A mídia `prefers-reduced-motion: reduce` reduz animações e transições.

## Demonstração

Abra `rafamass-blueprint-demo.html` no navegador. O arquivo funciona sem servidor, build ou JavaScript.
