# dirlizanu

Quebra-cabeça deslizante de quinze peças com 40 matrizes oficiais calibradas, manipulação direta e identidade RafaMass Blueprint.

## Jogar

Abra `index.html` ou publique a raiz como site estático.

Um nível também pode ser aberto por URL:

```text
?nivel=12
```

## Controles

- clique numa peça alinhada ao vazio;
- arraste a fileira ou coluna na direção do encaixe;
- use as setas do teclado;
- pressione `R` para reiniciar;
- use “Nova matriz” para uma prática calibrada sem alterar o recorde oficial.

## Dificuldade

Os níveis não são classificados apenas pelo número de embaralhamentos. As matrizes oficiais são medidas por distância Manhattan mais conflitos lineares.

| Faixa | Níveis | Índices |
|---|---:|---:|
| Iniciante | 1–10 | 9–17 |
| Médio | 11–20 | 22–31 |
| Difícil | 21–30 | 34–43 |
| Especialista | 31–40 | 46–55 |

Execute a auditoria:

```bash
node scripts/audit-levels.js
```

Detalhes: [`docs/AUDITORIA-LOGICA.md`](docs/AUDITORIA-LOGICA.md).

## Arquitetura

```text
index.html                         telas e semântica
game.js                            estado, entradas, cronômetro e áudio
levels.js                          40 matrizes oficiais
styles.css                         composição específica do jogo
manifest.json                      metadados PWA
scripts/audit-levels.js            auditor determinístico
design-system/rafamass-blueprint.css  sistema visual reutilizável
design-system/rafamass-blueprint-demo.html demonstração independente
```

O projeto não exige framework, bundler, instalação ou fontes externas.

## RafaMass Blueprint System

A identidade visual foi extraída para uma folha de estilo oficial que pode ser usada em outros projetos.

Comece por:

- [`design-system/README.md`](design-system/README.md)
- [`docs/IMPLEMENTAR-VISUAL.md`](docs/IMPLEMENTAR-VISUAL.md)
- [`design-system/rafamass-blueprint-demo.html`](design-system/rafamass-blueprint-demo.html)

Uso mínimo:

```html
<link rel="stylesheet" href="design-system/rafamass-blueprint.css">

<section data-rm-blueprint class="rm-surface">
  <span class="rm-kicker">Registro 001</span>
  <button class="rm-command" type="button">Executar</button>
</section>
```

## Desempenho do arraste

O gesto foi construído para evitar engasgos:

- elementos móveis são armazenados em `pointerdown`;
- `pointermove` apenas atualiza coordenadas;
- a escrita visual é agrupada por `requestAnimationFrame`;
- movimento usa `translate3d`;
- não há imagem animada, filtro ou `clip-path` nas peças;
- a peça 15 mantém a mesma geometria das demais;
- `prefers-reduced-motion` é respeitado.

## Persistência

O navegador armazena:

- `sp_melhor_N`: melhor quantidade de movimentos;
- `sp_feito_N`: nível concluído;
- `dz_audio`: preferência de som.

A matriz livre não grava recordes oficiais.

## Licença

MIT. Consulte [`LICENSE`](LICENSE).
