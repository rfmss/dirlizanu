#!/usr/bin/env node
'use strict';

var levels = require('../levels.js');
var SOLVED = '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0';

function row(index) { return Math.floor(index / 4); }
function col(index) { return index % 4; }

function inversions(board) {
  var list = board.filter(function (value) { return value !== 0; });
  var total = 0;
  for (var i = 0; i < list.length; i += 1) {
    for (var j = i + 1; j < list.length; j += 1) {
      if (list[i] > list[j]) total += 1;
    }
  }
  return total;
}

function isSolvable(board) {
  var blankRowFromBottom = 4 - row(board.indexOf(0));
  var count = inversions(board);
  return blankRowFromBottom % 2 === 0 ? count % 2 === 1 : count % 2 === 0;
}

function heuristic(board) {
  var score = 0;
  board.forEach(function (value, index) {
    if (!value) return;
    var goal = value - 1;
    score += Math.abs(row(index) - row(goal));
    score += Math.abs(col(index) - col(goal));
  });
  return score + linearConflict(board);
}

function linearConflict(board) {
  var conflicts = 0;
  var a;
  var b;
  var line;
  var valueA;
  var valueB;

  for (line = 0; line < 4; line += 1) {
    for (a = 0; a < 4; a += 1) {
      valueA = board[line * 4 + a];
      if (!valueA || row(valueA - 1) !== line) continue;
      for (b = a + 1; b < 4; b += 1) {
        valueB = board[line * 4 + b];
        if (valueB && row(valueB - 1) === line && col(valueA - 1) > col(valueB - 1)) conflicts += 2;
      }
    }
  }

  for (line = 0; line < 4; line += 1) {
    for (a = 0; a < 4; a += 1) {
      valueA = board[a * 4 + line];
      if (!valueA || col(valueA - 1) !== line) continue;
      for (b = a + 1; b < 4; b += 1) {
        valueB = board[b * 4 + line];
        if (valueB && col(valueB - 1) === line && row(valueA - 1) > row(valueB - 1)) conflicts += 2;
      }
    }
  }
  return conflicts;
}

function tier(level) {
  if (level <= 10) return 'Iniciante';
  if (level <= 20) return 'Médio';
  if (level <= 30) return 'Difícil';
  return 'Especialista';
}

var failures = [];
var seen = Object.create(null);
var scores = Object.create(null);

if (levels.length !== 40) failures.push('Esperados 40 níveis; encontrados ' + levels.length + '.');

levels.forEach(function (level, index) {
  var id = index + 1;
  var board = level.board;
  var key;
  var calculated;
  var tierName;

  if (level.id !== id) failures.push('ID fora de ordem no índice ' + index + '.');
  if (!Array.isArray(board) || board.length !== 16) {
    failures.push('Nível ' + id + ': tabuleiro não possui 16 posições.');
    return;
  }
  if (board.slice().sort(function (a, b) { return a - b; }).join(',') !== '0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15') failures.push('Nível ' + id + ': valores inválidos.');
  key = board.join(',');
  if (key === SOLVED) failures.push('Nível ' + id + ': começa resolvido.');
  if (seen[key]) failures.push('Níveis duplicados: ' + seen[key] + ' e ' + id + '.');
  seen[key] = id;
  if (!isSolvable(board)) failures.push('Nível ' + id + ': insolúvel.');
  calculated = heuristic(board);
  if (calculated !== level.score) failures.push('Nível ' + id + ': índice salvo ' + level.score + ', calculado ' + calculated + '.');
  tierName = tier(id);
  if (!scores[tierName]) scores[tierName] = [];
  scores[tierName].push(calculated);
});

Object.keys(scores).forEach(function (name) {
  var values = scores[name];
  var min = Math.min.apply(Math, values);
  var max = Math.max.apply(Math, values);
  var avg = values.reduce(function (sum, value) { return sum + value; }, 0) / values.length;
  console.log(name.padEnd(13) + ' mínimo=' + String(min).padStart(2) + ' máximo=' + String(max).padStart(2) + ' média=' + avg.toFixed(1));
});

for (var i = 1; i < levels.length; i += 1) {
  if (tier(i) === tier(i + 1) && levels[i].score < levels[i - 1].score) failures.push('Curva recua entre os níveis ' + i + ' e ' + (i + 1) + '.');
}

if (failures.length) {
  console.error('\nAUDITORIA REPROVADA\n');
  failures.forEach(function (failure) { console.error('- ' + failure); });
  process.exit(1);
}

console.log('\nAUDITORIA APROVADA');
console.log('40 níveis únicos, solúveis, não resolvidos e em progressão por faixa.');
