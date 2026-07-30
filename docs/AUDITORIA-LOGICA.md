# Auditoria de lógica e interação

Data: 30 de julho de 2026  
Baseline auditado: `196c1eb5b1794004ec0bb7aa8fd5157c12b65bb1`

## Problemas confirmados

### Movimento quebrado em toque e teclado

O baseline definia `tocarPeca(num)`, mas os caminhos de gesto e teclado chamavam `mover(alvo)`, função inexistente. Clique funcionava; os demais caminhos podiam lançar `ReferenceError`.

A correção cria um único motor de movimento. Clique, teclado e arraste convergem para a mesma mutação de linha e para a mesma verificação de vitória.

### Curva de dificuldade instável

O código anterior aumentava o tamanho de uma caminhada aleatória e classificava a dificuldade apenas pelo número do nível. Caminhadas longas podem voltar para perto da solução; por isso, níveis “Expert” podiam nascer mais fáceis que níveis “Difícil”.

Os 40 tabuleiros oficiais agora são pré-calibrados por distância Manhattan mais conflitos lineares. Todos foram produzidos por movimentos legais a partir da solução.

| Faixa | Níveis | Mínimo | Máximo | Média |
|---|---:|---:|---:|---:|
| Iniciante | 1–10 | 9 | 17 | 13,3 |
| Médio | 11–20 | 22 | 31 | 26,5 |
| Difícil | 21–30 | 34 | 43 | 38,5 |
| Especialista | 31–40 | 46 | 55 | 50,5 |

O índice é uma heurística de ordenação, não a quantidade exata de movimentos da solução ótima.

### Cronômetro injusto

O tempo começava ao abrir a tela. Agora começa no primeiro movimento válido, portanto leitura e orientação inicial não são contabilizadas.

### Gesto sem manipulação direta

O baseline apenas comparava `touchstart` e `touchend`. As peças não acompanhavam o dedo.

O novo arraste:

- acompanha o ponteiro em tempo real;
- restringe o movimento ao eixo legal;
- move toda a linha alinhada ao vazio;
- confirma a partir de 18% do percurso;
- armazena os elementos no início do gesto;
- usa um único `requestAnimationFrame` por quadro;
- não consulta o DOM dentro de `pointermove`;
- usa `translate3d` e desliga a transição durante a manipulação.

### Pintura concorrente

O fundo WebP animado era repartido entre quinze peças. Essa decoração podia continuar decodificando e pintando enquanto as peças eram transformadas.

A superfície padrão passa a ser CSS. Nenhuma imagem animada, filtro ou `clip-path` participa do arraste.

### Cartões de nível sem semântica

Os níveis eram `div`s clicáveis. Agora são botões nativos com foco, nome acessível, estado concluído e recorde.

## Pontuação e compatibilidade

Mover uma linha soma a quantidade de peças que realmente trocaram de encaixe. As chaves existentes foram preservadas:

- `sp_melhor_N` para recordes;
- `sp_feito_N` para conclusão;
- `?nivel=N` para abertura direta.

“Nova matriz” cria uma prática calibrada na faixa atual. Ela não altera o recorde oficial.

## Auditor automatizado

Execute:

```bash
node scripts/audit-levels.js
```

O script reprova quando encontra quantidade incorreta, valores duplicados, tabuleiro resolvido, duplicidade entre níveis, insolubilidade, índice divergente ou recuo dentro da mesma faixa.

Saída esperada:

```text
Iniciante     mínimo= 9 máximo=17 média=13.3
Médio         mínimo=22 máximo=31 média=26.5
Difícil       mínimo=34 máximo=43 média=38.5
Especialista  mínimo=46 máximo=55 média=50.5

AUDITORIA APROVADA
40 níveis únicos, solúveis, não resolvidos e em progressão por faixa.
```
