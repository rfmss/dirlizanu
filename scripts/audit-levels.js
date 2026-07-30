#!/usr/bin/env node
'use strict';

var content = require('../levels.js');
var failures = [];
var seen = {};

function solved(size) {
  var result = [];
  for (var value = 1; value < size * size; value += 1) result.push(value);
  result.push(0);
  return result;
}

function row(index, size) { return Math.floor(index / size); }
function col(index, size) { return index % size; }

function heuristic(board, size) {
  var score = 0;
  board.forEach(function (value, index) {
    if (!value) return;
    var goal = value - 1;
    score += Math.abs(row(index, size) - row(goal, size)) + Math.abs(col(index, size) - col(goal, size));
  });
  return score + linearConflict(board, size);
}

function linearConflict(values, size) {
  var conflicts = 0;
  var line;
  var a;
  var b;
  var valueA;
  var valueB;
  for (line = 0; line < size; line += 1) {
    for (a = 0; a < size; a += 1) {
      valueA = values[line * size + a];
      if (!valueA || row(valueA - 1, size) !== line) continue;
      for (b = a + 1; b < size; b += 1) {
        valueB = values[line * size + b];
        if (valueB && row(valueB - 1, size) === line && col(valueA - 1, size) > col(valueB - 1, size)) conflicts += 2;
      }
    }
  }
  for (line = 0; line < size; line += 1) {
    for (a = 0; a < size; a += 1) {
      valueA = values[a * size + line];
      if (!valueA || col(valueA - 1, size) !== line) continue;
      for (b = a + 1; b < size; b += 1) {
        valueB = values[b * size + line];
        if (valueB && col(valueB - 1, size) === line && row(valueA - 1, size) > row(valueB - 1, size)) conflicts += 2;
      }
    }
  }
  return conflicts;
}

function inversions(board) {
  var values = board.filter(function (value) { return value !== 0; });
  var count = 0;
  for (var i = 0; i < values.length; i += 1) {
    for (var j = i + 1; j < values.length; j += 1) if (values[i] > values[j]) count += 1;
  }
  return count;
}

function isSolvable(board, size) {
  var inv = inversions(board);
  if (size % 2 === 1) return inv % 2 === 0;
  var blankRowFromBottom = size - Math.floor(board.indexOf(0) / size);
  return blankRowFromBottom % 2 === 0 ? inv % 2 === 1 : inv % 2 === 0;
}

function validateEntry(entry, group) {
  var label = group + ' ' + entry.id;
  var expected = solved(entry.size);
  var sorted = entry.board.slice().sort(function (a, b) { return a - b; });
  var expectedSorted = expected.slice().sort(function (a, b) { return a - b; });
  var key = entry.size + ':' + entry.board.join(',');

  if (entry.size !== 4 && entry.size !== 5) failures.push(label + ': tamanho não suportado.');
  if (entry.board.length !== entry.size * entry.size) failures.push(label + ': quantidade de posições incorreta.');
  if (sorted.join(',') !== expectedSorted.join(',')) failures.push(label + ': peças ausentes, duplicadas ou fora da faixa.');
  if (entry.board.join(',') === expected.join(',')) failures.push(label + ': começa resolvido.');
  if (!isSolvable(entry.board, entry.size)) failures.push(label + ': paridade insolúvel.');
  if (heuristic(entry.board, entry.size) !== entry.score) failures.push(label + ': índice declarado não corresponde à heurística.');
  if (seen[key]) failures.push(label + ': duplica ' + seen[key] + '.');
  seen[key] = label;
  if (!entry.objective || ['classic','moves','time','hybrid'].indexOf(entry.objective.type) < 0) failures.push(label + ': objetivo inválido.');
  if ((entry.objective.type === 'moves' || entry.objective.type === 'hybrid') && !(entry.objective.moves > 0)) failures.push(label + ': meta de movimentos inválida.');
  if ((entry.objective.type === 'time' || entry.objective.type === 'hybrid') && !(entry.objective.seconds > 0)) failures.push(label + ': meta de tempo inválida.');
}

if (!content || content.version !== 2) failures.push('Payload de conteúdo ausente ou versão incorreta.');
if (!content.campaign || content.campaign.length !== 10) failures.push('A campanha deve conter exatamente 10 capítulos.');
if (!content.challenges || content.challenges.length !== 50) failures.push('O laboratório deve conter exatamente 50 desafios.');

(content.campaign || []).forEach(function (entry) { validateEntry(entry, 'Campanha'); });
(content.challenges || []).forEach(function (entry) { validateEntry(entry, 'Desafio'); });

for (var i = 1; i < content.campaign.length; i += 1) {
  if (content.campaign[i].score < content.campaign[i - 1].score) failures.push('Campanha: a dificuldade retrocede entre ' + i + ' e ' + (i + 1) + '.');
}
for (var j = 1; j < content.challenges.length; j += 1) {
  if (content.challenges[j].size < content.challenges[j - 1].size) failures.push('Desafios: o tamanho do tabuleiro retrocede.');
  if (content.challenges[j].size === content.challenges[j - 1].size && content.challenges[j].score < content.challenges[j - 1].score) failures.push('Desafios: o índice retrocede entre ' + j + ' e ' + (j + 1) + '.');
}

function summary(entries) {
  return entries.reduce(function (acc, entry) {
    var key = entry.size + 'x' + entry.size;
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry.score);
    return acc;
  }, {});
}

console.log('Campanha:', JSON.stringify(summary(content.campaign)));
console.log('Desafios:', JSON.stringify(summary(content.challenges)));

if (failures.length) {
  console.error('\nAUDITORIA REPROVADA');
  failures.forEach(function (failure) { console.error('- ' + failure); });
  process.exit(1);
}

console.log('\nAUDITORIA APROVADA');
console.log('10 capítulos + 50 desafios únicos, solúveis, não resolvidos e em progressão.');
