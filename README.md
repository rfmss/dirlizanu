# dirlizanu

Quebra-cabeça deslizante offline-first com campanha de 10 capítulos, laboratório de 50 desafios e identidade RafaMass Blueprint.

## Estrutura de jogo

- campanha com 10 capítulos;
- laboratório com 50 desafios divididos em cinco séries;
- matrizes 4 × 4 e 5 × 5;
- objetivos clássicos, por movimentos, por tempo e híbridos;
- metas bônus que concedem selos sem bloquear a conclusão;
- geração determinística por movimentos legais;
- auditoria de paridade, unicidade e progressão.

## Controles

- clique ou toque em uma peça alinhada ao vazio;
- arraste uma fileira ou coluna válida;
- use as setas do teclado;
- pressione `R` para reiniciar.

## Responsividade

Durante a partida, o aparato se adapta ao `visualViewport` por largura e altura.

A tela de jogo:

- permanece centralizada;
- evita rolagem da página;
- reduz metadados antes de reduzir o tabuleiro;
- possui composições próprias para retrato e paisagem;
- reage à abertura e ao fechamento das barras do navegador móvel;
- respeita áreas seguras de dispositivos com recortes.

A seleção de capítulos e desafios continua rolável, pois é uma tela de catálogo.

## Áudio

O sistema de áudio utiliza síntese local e permanece disponível offline.

A camada `audio-engine.js`:

- suaviza os timbres com osciladores senoidais;
- reduz energia aguda por filtro passa-baixas;
- mantém volume global baixo;
- usa compressor curto para controlar picos;
- aplica `voice stealing`: um novo som encerra o anterior imediatamente com uma rampa de 7 ms.

A linguagem de microsons foi comparada com o pacote Kenney UI Audio, publicado sob CC0. Nenhum áudio remoto é carregado.

Documentação completa: [`docs/AUDIO.md`](docs/AUDIO.md).

## Animações

Ao entrar, reiniciar ou gerar uma variação, uma sequência de aproximadamente 2,85 segundos desenha o blueprint do tabuleiro e revela as peças.

Na vitória, confetes editoriais usam papel, cyan, marcas de registro e pequenos selos vermelhos.

`prefers-reduced-motion` reduz as animações para uma transição breve.

## Validação dos desafios

Execute:

```bash
node --check game.js
node --check levels.js
node --check audio-engine.js
node scripts/audit-levels.js
```

O auditor exige:

- 10 capítulos;
- 50 desafios;
- matrizes completas;
- estados iniciais não resolvidos;
- ausência de duplicatas;
- paridade solúvel;
- progressão sem regressão;
- índices baseados em Manhattan + conflitos lineares.

## Sistema visual

Arquivos reutilizáveis:

```text
design-system/rafamass-blueprint.css
design-system/rafamass-blueprint-demo.html
design-system/README.md
docs/IMPLEMENTAR-VISUAL.md
```

O sistema é isolado por `[data-rm-blueprint]`, utiliza tokens `--rm-*` e componentes `.rm-*`, sem frameworks, fontes remotas ou JavaScript obrigatório.

## Licença

MIT para o código e o sistema visual, conforme [`LICENSE`](LICENSE).
