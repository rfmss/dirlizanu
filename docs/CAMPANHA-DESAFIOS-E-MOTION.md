# Campanha, desafios e motion system

## Decisão de produto

A antiga lista de quarenta níveis visualmente equivalentes foi substituída por duas rotas:

1. uma campanha curta, legível e autoral;
2. um laboratório extenso para repetição e domínio.

A campanha tem dez capítulos. O laboratório mantém cinquenta desafios para quem deseja continuar.

## Progressão

### Campanha

| Capítulos | Grade | Função |
|---|---|---|
| 1–2 | 4 × 4 | ensinar gesto, vazio e deslocamento em linha |
| 3–4 | 4 × 4 | aumentar conflito e distância |
| 5–6 | 5 × 5 | introduzir a nova escala |
| 7–8 | 5 × 5 | exigir memória espacial |
| 9–10 | 5 × 5 | clímax de complexidade |

Os índices oficiais progridem de 16 a 100.

### Desafios

- 20 matrizes 4 × 4;
- 30 matrizes 5 × 5;
- cinco séries de dez;
- índices crescentes dentro de cada tamanho;
- quatro tipos de objetivo alternados.

## Objetivos

As metas são bônus, não bloqueios.

### Clássico

Concluir a matriz concede o selo de restauração.

### Precisão

Concluir abaixo da meta de movimentos concede o selo.

### Tempo

Concluir abaixo da meta cronológica concede o selo.

### Meta dupla

Exige tempo e movimentos simultaneamente para o selo.

Mesmo quando a meta não é atingida, a fase pode ser concluída. Essa decisão evita transformar uma matriz matematicamente solúvel em desafio funcionalmente impossível por causa de um limite mal calibrado.

## Solubilidade

`levels.js` armazena tamanho, semente e quantidade de passos.

Na inicialização, cada matriz é materializada assim:

1. cria-se o estado resolvido;
2. um PRNG determinístico escolhe apenas vizinhos legais do vazio;
3. o movimento imediatamente inverso é evitado quando há alternativa;
4. a sequência continua pelo número de passos registrado.

Logo, toda matriz possui pelo menos um caminho inverso conhecido até a solução.

A auditoria adiciona uma segunda barreira:

- testa a paridade;
- verifica todas as peças;
- rejeita estados resolvidos;
- rejeita duplicatas;
- recalcula Manhattan + conflitos lineares;
- verifica progressão e quantidades.

## Tabuleiros variáveis

O motor não possui mais `SIZE = 4` fixo.

Ao iniciar uma entrada:

- `SIZE` recebe 4 ou 5;
- o estado resolvido é reconstruído;
- sockets e peças são recriados;
- teclado, linha de movimento, heurística e redimensionamento usam o tamanho atual;
- a peça-sinal é sempre a última: 15 no 4 × 4 e 24 no 5 × 5.

Nenhum algoritmo separado foi criado para 5 × 5. A mesma regra serve às duas escalas.

## Centralização e responsividade

O tabuleiro considera:

- largura disponível;
- altura de `visualViewport`;
- barras móveis do navegador;
- safe areas;
- orientação;
- quantidade de células.

O chassi usa largura intrínseca. O quadrado interno é a única medida calculada pelo JavaScript, evitando a antiga soma acidental de largura + padding + borda.

## Entrada blueprint

`runBlueprintIntro()` bloqueia o tabuleiro durante a construção.

A sequência normal dura aproximadamente 2,85 segundos:

1. overlay técnico;
2. desenho do perímetro;
3. linhas verticais e horizontais;
4. marcas de canto;
5. revelação dos encaixes;
6. assentamento das peças;
7. liberação da entrada.

A grade SVG é gerada a partir do tamanho atual, portanto 4 × 4 e 5 × 5 recebem desenhos coerentes.

Com movimento reduzido, a sequência dura cerca de 130 ms.

## Vitória

`launchConfetti()` cria elementos CSS de quatro famílias:

- papel;
- cyan;
- linha de registro;
- selo vermelho.

Não há biblioteca, canvas, imagem ou arquivo remoto.

A quantidade é maior quando a meta bônus foi atingida. Os elementos são removidos do DOM após a animação.

## Rodapé

Os três comandos têm o mesmo peso:

- Reiniciar;
- Variação;
- Som.

“Variação” não usa vermilion. O laranja permanece no tabuleiro e no momento de conclusão, preservando a hierarquia.

## Recordes

Campanha e desafios usam chaves diferentes. A opção “Variação” nunca escreve recordes nem selos oficiais.

## Manutenção

Depois de alterar qualquer especificação em `levels.js`, execute:

```bash
node --check game.js
node --check levels.js
node scripts/audit-levels.js
```

Não aceite uma matriz nova apenas porque “parece embaralhada”. A auditoria precisa permanecer verde.
