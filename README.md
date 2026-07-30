# dirlizanu

Quebra-cabeça deslizante offline com campanha de dez capítulos, cinquenta desafios auditados, tabuleiros 4 × 4 e 5 × 5 e identidade RafaMass Blueprint.

## Jogar

Abra `index.html` ou publique a raiz como site estático.

Atalhos por URL:

```text
?nivel=7
?desafio=32
```

## Modos

### Campanha

Dez capítulos oficiais:

- capítulos 1–4: tabuleiro 4 × 4;
- capítulos 5–10: tabuleiro 5 × 5;
- progressão medida por distância Manhattan mais conflitos lineares;
- metas bônus de tempo, movimentos ou meta dupla;
- a meta bônus concede selo, mas não impede a conclusão da matriz.

### Laboratório

Cinquenta desafios divididos em cinco séries:

- Série A: desafios 1–10;
- Série B: desafios 11–20;
- Série C: desafios 21–30;
- Série D: desafios 31–40;
- Série E: desafios 41–50.

Os desafios alternam restauração clássica, precisão, tempo e meta dupla.

## Garantia de solução

Todas as matrizes são construídas a partir do estado resolvido por uma sequência determinística de movimentos legais.

Além dessa garantia por construção, a auditoria valida:

- quantidade e faixa das peças;
- ausência de duplicatas;
- estado inicial não resolvido;
- paridade solúvel;
- índice heurístico declarado;
- progressão sem regressão;
- exatamente 10 capítulos e 50 desafios.

Execute:

```bash
node --check game.js
node --check levels.js
node scripts/audit-levels.js
```

Resultado esperado:

```text
AUDITORIA APROVADA
10 capítulos + 50 desafios únicos, solúveis, não resolvidos e em progressão.
```

## Controles

- clique numa peça alinhada ao vazio;
- arraste uma fileira ou coluna na direção do encaixe;
- use as setas do teclado;
- pressione `R` para reiniciar;
- use “Variação” para gerar uma matriz solúvel de dificuldade próxima, sem alterar recordes oficiais.

## Movimento e desempenho

O arraste evita trabalho desnecessário:

- elementos móveis são armazenados no início do gesto;
- `pointermove` atualiza apenas coordenadas;
- escritas visuais são agrupadas por `requestAnimationFrame`;
- deslocamento usa `translate3d`;
- não há imagens animadas, filtros ou `clip-path` nas peças;
- redimensionamento considera largura, altura, orientação e `visualViewport`.

## Motion system

Ao abrir ou reiniciar uma matriz:

1. o chassi entra em estado de construção;
2. linhas cyan desenham a grade;
3. marcações de registro fecham o blueprint;
4. as peças assentam;
5. o tabuleiro é liberado em aproximadamente 2,8 segundos.

Na vitória, o jogo produz confetes editoriais com papel, linhas cyan, marcas de corte e selos vermelhos. `prefers-reduced-motion` substitui ambas as sequências por transições quase imediatas.

## Estrutura

```text
index.html
game.js
levels.js
styles.css
refinement.css
responsive-center.css
experience.css
manifest.json
scripts/audit-levels.js
docs/AUDITORIA-LOGICA.md
docs/CAMPANHA-DESAFIOS-E-MOTION.md
design-system/rafamass-blueprint.css
design-system/rafamass-blueprint-demo.html
design-system/README.md
docs/IMPLEMENTAR-VISUAL.md
```

## RafaMass Blueprint System

A identidade visual reutilizável está documentada em:

- [`design-system/README.md`](design-system/README.md)
- [`docs/IMPLEMENTAR-VISUAL.md`](docs/IMPLEMENTAR-VISUAL.md)
- [`design-system/rafamass-blueprint-demo.html`](design-system/rafamass-blueprint-demo.html)

A camada `experience.css` contém as composições específicas deste jogo: seleção de modos, metas, construção animada do tabuleiro e confetes de vitória.

## Persistência

O navegador armazena:

- `sp_melhor_N`: melhor quantidade de movimentos da campanha;
- `sp_feito_N`: capítulo concluído;
- `dz_campanha_tempo_N`: melhor tempo da campanha;
- `dz_desafio_melhor_N`: melhor quantidade de movimentos do desafio;
- `dz_desafio_tempo_N`: melhor tempo do desafio;
- `dz_desafio_feito_N`: desafio concluído;
- `dz_selo_<modo>_N`: meta bônus conquistada;
- `dz_audio`: preferência de som.

## Licença

MIT. Consulte [`LICENSE`](LICENSE).
