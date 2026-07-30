(function () {
  'use strict';

  var CONTENT = window.DIRLIZANU_CONTENT || { campaign: [], challenges: [] };
  var MOVE_MS = 190;
  var screens = {
    select: document.getElementById('screen-select'),
    game: document.getElementById('screen-game'),
    win: document.getElementById('screen-win')
  };

  var campaignGrid = document.getElementById('campaignGrid');
  var challengeGrid = document.getElementById('challengeGrid');
  var challengeSeries = document.getElementById('challengeSeries');
  var campaignPanel = document.getElementById('campaignPanel');
  var challengesPanel = document.getElementById('challengesPanel');
  var modeCampaign = document.getElementById('modeCampaign');
  var modeChallenges = document.getElementById('modeChallenges');

  var boardArea = document.getElementById('boardArea');
  var boardEl = document.getElementById('board');
  var boardShell = document.getElementById('boardShell');
  var machineEl = document.getElementById('machine');
  var blueprintIntro = document.getElementById('blueprintIntro');

  var levelEl = document.getElementById('gameLevel');
  var diffEl = document.getElementById('gameDifficulty');
  var matrixEl = document.getElementById('gameMatrix');
  var modeLabelEl = document.getElementById('gameModeLabel');
  var titleEl = document.getElementById('gameTitle');
  var seriesEl = document.getElementById('gameSeries');
  var sizeEl = document.getElementById('gameSize');
  var stateEl = document.getElementById('gameState');
  var objectiveEl = document.getElementById('gameObjective');
  var progressEl = document.getElementById('gameProgress');
  var movesEl = document.getElementById('statMoves');
  var timeEl = document.getElementById('statTime');
  var soundEl = document.getElementById('soundToggle');
  var liveEl = document.getElementById('gameLive');

  var winLevelEl = document.getElementById('winLevel');
  var winMovesEl = document.getElementById('winMoves');
  var winTimeEl = document.getElementById('winTime');
  var winRecordEl = document.getElementById('winRecord');
  var winMarkEl = document.getElementById('winMark');
  var winSealEl = document.getElementById('winSeal');
  var winSealCodeEl = document.getElementById('winSealCode');
  var winSealTitleEl = document.getElementById('winSealTitle');
  var winObjectiveEl = document.getElementById('winObjective');
  var confettiLayer = document.getElementById('confettiLayer');
  var nextEl = document.getElementById('btnNext');

  var menuMode = 'campaign';
  var currentSeries = 'A';
  var playMode = 'campaign';
  var currentId = 1;
  var currentData = null;
  var SIZE = 4;
  var SOLVED = solvedBoard(SIZE);
  var board = SOLVED.slice();
  var initialBoard = SOLVED.slice();
  var empty = SOLVED.length - 1;
  var moves = 0;
  var elapsed = 0;
  var startedAt = 0;
  var timer = null;
  var locked = false;
  var practice = false;
  var tiles = {};
  var slots = [];
  var tileSize = 0;
  var gap = 0;
  var pitch = 0;
  var drag = null;
  var suppressClick = false;
  var audioContext = null;
  var audioEnabled = storageGet('dz_audio') !== 'off';
  var reducedMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var blueprintToken = 0;
  var resizeTimer = null;

  function storageGet(key) {
    try { return localStorage.getItem(key); } catch (error) { return null; }
  }

  function storageSet(key, value) {
    try { localStorage.setItem(key, value); } catch (error) {}
  }

  function solvedBoard(size) {
    var values = [];
    for (var value = 1; value < size * size; value += 1) values.push(value);
    values.push(0);
    return values;
  }

  function row(index) { return Math.floor(index / SIZE); }
  function col(index) { return index % SIZE; }

  function entryById(mode, id) {
    var list = mode === 'challenge' ? CONTENT.challenges : CONTENT.campaign;
    for (var i = 0; i < list.length; i += 1) if (list[i].id === id) return list[i];
    return null;
  }

  function formatTime(seconds) {
    var minutes = Math.floor(seconds / 60);
    var rest = seconds % 60;
    return minutes + ':' + (rest < 10 ? '0' : '') + rest;
  }

  function currentElapsed() {
    return startedAt ? elapsed + Math.floor((Date.now() - startedAt) / 1000) : elapsed;
  }

  function objectiveLabel(data) {
    var objective = data.objective || { type: 'classic' };
    if (objective.type === 'moves') return 'Selo de precisão: até ' + objective.moves + ' movimentos.';
    if (objective.type === 'time') return 'Selo de tempo: até ' + formatTime(objective.seconds) + '.';
    if (objective.type === 'hybrid') return 'Selo duplo: até ' + objective.moves + ' movimentos e ' + formatTime(objective.seconds) + '.';
    return 'Objetivo: restaure a sequência.';
  }

  function progressLabel() {
    if (!currentData) return '';
    var objective = currentData.objective || { type: 'classic' };
    var now = currentElapsed();
    if (objective.type === 'moves') return moves + ' / ' + objective.moves + ' mov.';
    if (objective.type === 'time') return formatTime(now) + ' / ' + formatTime(objective.seconds);
    if (objective.type === 'hybrid') return moves + '/' + objective.moves + ' · ' + formatTime(now) + '/' + formatTime(objective.seconds);
    return practice ? 'Matriz livre · sem recorde' : 'Registro oficial';
  }

  function updateStats() {
    movesEl.textContent = String(moves);
    timeEl.textContent = formatTime(currentElapsed());
    progressEl.textContent = progressLabel();
  }

  function startTimer() {
    if (startedAt) return;
    startedAt = Date.now();
    timer = window.setInterval(updateStats, 250);
  }

  function stopTimer() {
    if (startedAt) {
      elapsed = currentElapsed();
      startedAt = 0;
    }
    if (timer) window.clearInterval(timer);
    timer = null;
    updateStats();
  }

  function resetTimer() {
    if (timer) window.clearInterval(timer);
    timer = null;
    startedAt = 0;
    elapsed = 0;
    updateStats();
  }

  function show(name) {
    Object.keys(screens).forEach(function (key) {
      var active = key === name;
      screens[key].classList.toggle('active', active);
      screens[key].setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    if (name !== 'game') stopTimer();
  }

  function setMenuMode(mode) {
    menuMode = mode;
    var campaignActive = mode === 'campaign';
    modeCampaign.classList.toggle('active', campaignActive);
    modeChallenges.classList.toggle('active', !campaignActive);
    modeCampaign.setAttribute('aria-pressed', campaignActive ? 'true' : 'false');
    modeChallenges.setAttribute('aria-pressed', campaignActive ? 'false' : 'true');
    campaignPanel.hidden = !campaignActive;
    challengesPanel.hidden = campaignActive;
  }

  function recordKey(mode, id) {
    return mode === 'campaign' ? 'sp_melhor_' + id : 'dz_desafio_melhor_' + id;
  }

  function timeKey(mode, id) {
    return mode === 'campaign' ? 'dz_campanha_tempo_' + id : 'dz_desafio_tempo_' + id;
  }

  function doneKey(mode, id) {
    return mode === 'campaign' ? 'sp_feito_' + id : 'dz_desafio_feito_' + id;
  }

  function sealKey(mode, id) {
    return 'dz_selo_' + mode + '_' + id;
  }

  function cardFor(data, mode) {
    var button = document.createElement('button');
    var best = storageGet(recordKey(mode, data.id));
    var done = storageGet(doneKey(mode, data.id));
    var sealed = storageGet(sealKey(mode, data.id));
    var modeName = mode === 'campaign' ? 'Capítulo ' + data.id : 'Desafio ' + data.id;
    var numberText = data.id < 10 && mode === 'challenge' ? '0' + data.id : String(data.id);
    button.type = 'button';
    button.className = 'level-card ' + (data.size === 5 ? 'expert' : data.score >= 30 ? 'hard' : data.score >= 20 ? 'medium' : 'easy');
    button.setAttribute('aria-label', modeName + ', ' + data.size + ' por ' + data.size + ', índice ' + data.score + (done ? ', concluído' : '') + (sealed ? ', selo conquistado' : ''));
    button.innerHTML =
      '<span class="level-status" aria-hidden="true">' + (sealed ? '◆' : done ? '✓' : '—') + '</span>' +
      '<span class="level-number">' + numberText + '</span>' +
      '<span class="level-name">' + escapeHTML(data.title) + '</span>' +
      '<span class="level-score">' + data.size + ' × ' + data.size + ' · índice ' + data.score + '</span>' +
      '<span class="level-best">' + (best ? 'Melhor ' + best + ' mov.' : objectiveShort(data)) + '</span>';
    button.addEventListener('click', function () {
      playButton();
      startEntry(mode, data.id);
    });
    return button;
  }

  function objectiveShort(data) {
    var objective = data.objective || { type: 'classic' };
    if (objective.type === 'moves') return 'Meta de precisão';
    if (objective.type === 'time') return 'Meta de tempo';
    if (objective.type === 'hybrid') return 'Meta dupla';
    return 'Restauração clássica';
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function buildMenus() {
    campaignGrid.innerHTML = '';
    CONTENT.campaign.forEach(function (data) {
      campaignGrid.appendChild(cardFor(data, 'campaign'));
    });

    challengeSeries.innerHTML = '';
    ['A','B','C','D','E'].forEach(function (series) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'series-button' + (series === currentSeries ? ' active' : '');
      button.textContent = 'Série ' + series;
      button.setAttribute('aria-pressed', series === currentSeries ? 'true' : 'false');
      button.addEventListener('click', function () {
        currentSeries = series;
        buildMenus();
      });
      challengeSeries.appendChild(button);
    });

    challengeGrid.innerHTML = '';
    CONTENT.challenges.forEach(function (data) {
      if (data.series === currentSeries) challengeGrid.appendChild(cardFor(data, 'challenge'));
    });
  }

  function createBoardDOM() {
    var slotsLayer = document.createElement('div');
    var tilesLayer = document.createElement('div');
    boardEl.innerHTML = '';
    tiles = {};
    slots = [];
    slotsLayer.className = 'slots-layer';
    slotsLayer.setAttribute('aria-hidden', 'true');
    tilesLayer.className = 'tiles-layer';

    for (var index = 0; index < SIZE * SIZE; index += 1) {
      var slot = document.createElement('div');
      slot.className = 'slot';
      slotsLayer.appendChild(slot);
      slots.push(slot);
    }

    for (var value = 1; value < SIZE * SIZE; value += 1) {
      var tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'tile';
      tile.dataset.value = String(value);
      tile.innerHTML = '<span class="tile-registration" aria-hidden="true"></span><span class="tile-number">' + value + '</span>';
      attachTile(tile, value);
      tiles[value] = tile;
      tilesLayer.appendChild(tile);
    }

    boardEl.dataset.size = String(SIZE);
    boardEl.setAttribute('aria-label', 'Quebra-cabeça ' + SIZE + ' por ' + SIZE + ' com ' + (SIZE * SIZE - 1) + ' peças');
    boardEl.appendChild(slotsLayer);
    boardEl.appendChild(tilesLayer);
  }

  function linePath(index) {
    if (index === empty || index < 0) return null;
    var step;
    if (row(index) === row(empty)) step = index > empty ? 1 : -1;
    else if (col(index) === col(empty)) step = index > empty ? SIZE : -SIZE;
    else return null;
    var path = [];
    for (var cursor = empty; ; cursor += step) {
      path.push(cursor);
      if (cursor === index) return path;
    }
  }

  function position(index) {
    return { x: gap + col(index) * pitch, y: gap + row(index) * pitch };
  }

  function place(element, index, dx, dy) {
    var point = position(index);
    element.style.transform = 'translate3d(' + (point.x + (dx || 0)) + 'px,' + (point.y + (dy || 0)) + 'px,0)';
  }

  function resizeBoard() {
    if (drag) finishDrag(true);
    var viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    var heightShare = SIZE === 5 ? .58 : .62;
    var maxSize = SIZE === 5 ? 530 : 520;
    var minimum = SIZE === 5 ? 235 : 220;
    var available = Math.min(boardArea.clientWidth, viewportHeight * heightShare, maxSize);
    available = Math.max(minimum, available);
    gap = Math.max(4, Math.min(SIZE === 5 ? 8 : 10, Math.round(available * .018)));
    tileSize = Math.floor((available - gap * (SIZE + 1)) / SIZE);
    pitch = tileSize + gap;
    var size = tileSize * SIZE + gap * (SIZE + 1);
    boardEl.style.width = size + 'px';
    boardEl.style.height = size + 'px';
    boardShell.style.removeProperty('width');

    slots.forEach(function (slot, index) {
      slot.style.width = tileSize + 'px';
      slot.style.height = tileSize + 'px';
      place(slot, index);
    });

    Object.keys(tiles).forEach(function (key) {
      tiles[key].style.width = tileSize + 'px';
      tiles[key].style.height = tileSize + 'px';
      tiles[key].style.fontSize = Math.round(tileSize * (SIZE === 5 ? .29 : .36)) + 'px';
    });
    render(false);
  }

  function render(animate) {
    if (!animate || reducedMotion) boardEl.classList.add('no-motion');
    Object.keys(tiles).forEach(function (key) {
      var value = Number(key);
      var index = board.indexOf(value);
      var tile = tiles[value];
      var movable = !!linePath(index);
      tile.dataset.index = String(index);
      tile.classList.toggle('movable', movable);
      tile.classList.toggle('hero-tile', value === SIZE * SIZE - 1);
      tile.setAttribute('aria-label', 'Peça ' + value + (movable ? ', pode deslizar' : ''));
      place(tile, index);
    });
    if (!animate || reducedMotion) {
      boardEl.offsetHeight;
      requestAnimationFrame(function () { boardEl.classList.remove('no-motion'); });
    }
    updateStats();
  }

  function mutate(path) {
    for (var i = 0; i < path.length - 1; i += 1) board[path[i]] = board[path[i + 1]];
    board[path[path.length - 1]] = 0;
    empty = path[path.length - 1];
  }

  function solved() {
    for (var i = 0; i < SOLVED.length; i += 1) if (board[i] !== SOLVED[i]) return false;
    return true;
  }

  function commit(index, path) {
    if (locked) return false;
    path = path || linePath(index);
    if (!path || path.length < 2) return false;
    startTimer();
    locked = true;
    mutate(path);
    moves += path.length - 1;
    render(true);
    playSlide(path.length - 1);
    liveEl.textContent = (path.length - 1) + ' peça(s) deslizada(s).';
    window.setTimeout(function () {
      locked = false;
      if (solved()) completeEntry();
    }, reducedMotion ? 10 : MOVE_MS + 35);
    return true;
  }

  function attachTile(tile, value) {
    tile.addEventListener('click', function () {
      if (suppressClick || locked) return;
      var index = board.indexOf(value);
      if (!linePath(index)) return;
      tile.classList.add('key-down');
      playPress();
      window.setTimeout(function () {
        tile.classList.remove('key-down');
        commit(index);
      }, reducedMotion ? 0 : 45);
    });

    if (window.PointerEvent) {
      tile.addEventListener('pointerdown', function (event) {
        beginDrag(tile, value, event.clientX, event.clientY, event.pointerId, 'pointer');
        if (!drag) return;
        try { tile.setPointerCapture(event.pointerId); } catch (error) {}
        event.preventDefault();
      });
      tile.addEventListener('pointermove', function (event) {
        if (drag && drag.mode === 'pointer' && drag.id === event.pointerId) moveDrag(event.clientX, event.clientY);
      });
      tile.addEventListener('pointerup', function (event) {
        if (drag && drag.mode === 'pointer' && drag.id === event.pointerId) finishDrag(false);
      });
      tile.addEventListener('pointercancel', function (event) {
        if (drag && drag.mode === 'pointer' && drag.id === event.pointerId) finishDrag(true);
      });
      tile.addEventListener('lostpointercapture', function () {
        if (drag && drag.mode === 'pointer') finishDrag(true);
      });
    } else {
      tile.addEventListener('touchstart', function (event) {
        var touch = event.changedTouches[0];
        beginDrag(tile, value, touch.clientX, touch.clientY, touch.identifier, 'touch');
      }, { passive: true });
      tile.addEventListener('touchmove', function (event) {
        if (!drag || drag.mode !== 'touch') return;
        var touch = findTouch(event.changedTouches, drag.id);
        if (!touch) return;
        event.preventDefault();
        moveDrag(touch.clientX, touch.clientY);
      }, { passive: false });
      tile.addEventListener('touchend', function (event) {
        if (drag && drag.mode === 'touch' && findTouch(event.changedTouches, drag.id)) finishDrag(false);
      }, { passive: true });
      tile.addEventListener('touchcancel', function () {
        if (drag && drag.mode === 'touch') finishDrag(true);
      }, { passive: true });
      tile.addEventListener('mousedown', function (event) {
        if (event.button === 0) beginDrag(tile, value, event.clientX, event.clientY, 'mouse', 'mouse');
      });
    }
  }

  function findTouch(list, id) {
    for (var i = 0; i < list.length; i += 1) if (list[i].identifier === id) return list[i];
    return null;
  }

  function beginDrag(tile, value, x, y, id, mode) {
    if (locked || drag) return;
    var index = board.indexOf(value);
    var path = linePath(index);
    if (!path) return;
    var axis = row(index) === row(empty) ? 'x' : 'y';
    var sign = axis === 'x' ? (col(empty) > col(index) ? 1 : -1) : (row(empty) > row(index) ? 1 : -1);
    var elements = [];
    for (var i = 1; i < path.length; i += 1) {
      var element = tiles[board[path[i]]];
      var base = position(path[i]);
      element.classList.add('dragging');
      elements.push({ el: element, x: base.x, y: base.y });
    }
    tile.classList.add('key-down');
    drag = { tile: tile, path: path, axis: axis, sign: sign, startX: x, startY: y, x: x, y: y, id: id, mode: mode, elements: elements, allowed: 0, frame: 0 };
    playPress();
  }

  function moveDrag(x, y) {
    if (!drag) return;
    drag.x = x;
    drag.y = y;
    if (!drag.frame) drag.frame = requestAnimationFrame(applyDrag);
  }

  function applyDrag() {
    if (!drag) return;
    drag.frame = 0;
    var raw = drag.axis === 'x' ? drag.x - drag.startX : drag.y - drag.startY;
    var direction = raw > 0 ? 1 : raw < 0 ? -1 : 0;
    drag.allowed = direction === drag.sign ? Math.min(Math.abs(raw), pitch) * drag.sign : 0;
    drag.elements.forEach(function (item) {
      var x = item.x + (drag.axis === 'x' ? drag.allowed : 0);
      var y = item.y + (drag.axis === 'y' ? drag.allowed : 0);
      item.el.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
    });
  }

  function finishDrag(cancelled) {
    if (!drag) return;
    var state = drag;
    if (state.frame) {
      cancelAnimationFrame(state.frame);
      state.frame = 0;
      applyDrag();
    }
    var success = !cancelled && Math.abs(state.allowed) >= pitch * .18;
    drag = null;
    state.elements.forEach(function (item) { item.el.classList.remove('dragging'); });
    state.tile.classList.remove('key-down');
    if (!success) {
      render(true);
      return;
    }
    suppressClick = true;
    window.setTimeout(function () { suppressClick = false; }, 260);
    mutate(state.path);
    startTimer();
    moves += state.path.length - 1;
    locked = true;
    playSlide(state.path.length - 1);
    liveEl.textContent = (state.path.length - 1) + ' peça(s) deslizada(s).';
    requestAnimationFrame(function () {
      render(true);
      window.setTimeout(function () {
        locked = false;
        if (solved()) completeEntry();
      }, reducedMotion ? 10 : MOVE_MS + 35);
    });
  }

  function difficultyText(data) {
    if (data.size === 4 && data.score < 20) return '4 × 4 · iniciação';
    if (data.size === 4 && data.score < 35) return '4 × 4 · tensão';
    if (data.size === 4) return '4 × 4 · especialista';
    if (data.score < 55) return '5 × 5 · expansão';
    if (data.score < 80) return '5 × 5 · profundo';
    return '5 × 5 · mestre';
  }

  function difficultyClass(data) {
    if (data.size === 5 && data.score >= 80) return 'expert';
    if (data.score >= 35) return 'hard';
    if (data.score >= 20) return 'medium';
    return 'easy';
  }

  function startEntry(mode, id) {
    var data = entryById(mode, id);
    if (!data) return;
    if (drag) finishDrag(true);
    playMode = mode;
    currentId = id;
    currentData = data;
    SIZE = data.size;
    SOLVED = solvedBoard(SIZE);
    board = data.board.slice();
    initialBoard = data.board.slice();
    empty = board.indexOf(0);
    moves = 0;
    practice = false;
    locked = true;
    resetTimer();
    createBoardDOM();

    levelEl.textContent = mode === 'campaign' ? 'Capítulo ' + id + ' de 10' : 'Desafio ' + id + ' de 50';
    diffEl.textContent = difficultyText(data);
    diffEl.className = 'game-difficulty ' + difficultyClass(data);
    matrixEl.textContent = 'Matriz oficial · índice ' + data.score;
    modeLabelEl.textContent = mode === 'campaign' ? 'Campanha // capítulo oficial' : 'Laboratório // série ' + data.series;
    titleEl.textContent = data.title;
    seriesEl.textContent = mode === 'campaign' ? 'SÉRIE C-' + (id < 10 ? '0' + id : id) : 'SÉRIE ' + data.series + '-' + (id < 10 ? '0' + id : id);
    sizeEl.textContent = 'ENCAIXES ' + (SIZE * SIZE);
    stateEl.textContent = 'ESTADO CONSTRUINDO';
    objectiveEl.textContent = objectiveLabel(data);
    winMarkEl.textContent = String(SIZE * SIZE - 1);
    updateStats();
    show('game');

    requestAnimationFrame(function () {
      resizeBoard();
      runBlueprintIntro();
    });
  }

  function restart() {
    if (!currentData) return;
    if (drag) finishDrag(true);
    board = initialBoard.slice();
    empty = board.indexOf(0);
    moves = 0;
    locked = true;
    resetTimer();
    render(false);
    playButton();
    runBlueprintIntro();
  }

  function shufflePractice() {
    if (!currentData) return;
    if (drag) finishDrag(true);
    var target = currentData.score;
    board = calibratedBoard(target, Math.max(6, target - 7), target + 7);
    initialBoard = board.slice();
    empty = board.indexOf(0);
    moves = 0;
    practice = true;
    locked = true;
    resetTimer();
    matrixEl.textContent = 'Matriz livre · índice ' + heuristic(board) + ' · sem recorde';
    render(false);
    playButton();
    runBlueprintIntro();
  }

  function calibratedBoard(target, minimum, maximum) {
    var best = null;
    var bestDistance = Infinity;
    for (var attempt = 0; attempt < 520; attempt += 1) {
      var candidate = randomWalk(55 + target * (SIZE === 5 ? 7 : 5) + (attempt % 19) * 3);
      var score = heuristic(candidate);
      var distance = Math.abs(score - target);
      if (score >= minimum && score <= maximum && distance < bestDistance) {
        best = candidate;
        bestDistance = distance;
        if (distance <= 1) break;
      }
    }
    return best || randomWalk(180 + target * 3);
  }

  function randomWalk(steps) {
    var result = SOLVED.slice();
    var hole = result.length - 1;
    var previous = -1;
    for (var i = 0; i < steps; i += 1) {
      var choices = [];
      if (row(hole) > 0) choices.push(hole - SIZE);
      if (row(hole) < SIZE - 1) choices.push(hole + SIZE);
      if (col(hole) > 0) choices.push(hole - 1);
      if (col(hole) < SIZE - 1) choices.push(hole + 1);
      var filtered = choices.filter(function (choice) { return choice !== previous; });
      if (!filtered.length) filtered = choices;
      var next = filtered[Math.floor(Math.random() * filtered.length)];
      result[hole] = result[next];
      result[next] = 0;
      previous = hole;
      hole = next;
    }
    return result;
  }

  function heuristic(values) {
    var score = 0;
    values.forEach(function (value, index) {
      if (!value) return;
      var goal = value - 1;
      score += Math.abs(row(index) - row(goal)) + Math.abs(col(index) - col(goal));
    });
    return score + linearConflict(values);
  }

  function linearConflict(values) {
    var conflicts = 0;
    var line;
    var a;
    var b;
    var valueA;
    var valueB;
    for (line = 0; line < SIZE; line += 1) {
      for (a = 0; a < SIZE; a += 1) {
        valueA = values[line * SIZE + a];
        if (!valueA || row(valueA - 1) !== line) continue;
        for (b = a + 1; b < SIZE; b += 1) {
          valueB = values[line * SIZE + b];
          if (valueB && row(valueB - 1) === line && col(valueA - 1) > col(valueB - 1)) conflicts += 2;
        }
      }
    }
    for (line = 0; line < SIZE; line += 1) {
      for (a = 0; a < SIZE; a += 1) {
        valueA = values[a * SIZE + line];
        if (!valueA || col(valueA - 1) !== line) continue;
        for (b = a + 1; b < SIZE; b += 1) {
          valueB = values[b * SIZE + line];
          if (valueB && col(valueB - 1) === line && row(valueA - 1) > row(valueB - 1)) conflicts += 2;
        }
      }
    }
    return conflicts;
  }

  function evaluateSeal(data, finalMoves, finalSeconds) {
    var objective = data.objective || { type: 'classic' };
    if (objective.type === 'moves') return finalMoves <= objective.moves;
    if (objective.type === 'time') return finalSeconds <= objective.seconds;
    if (objective.type === 'hybrid') return finalMoves <= objective.moves && finalSeconds <= objective.seconds;
    return true;
  }

  function completeEntry() {
    stopTimer();
    var finalSeconds = currentElapsed();
    var previousMoves = storageGet(recordKey(playMode, currentId));
    var previousTime = storageGet(timeKey(playMode, currentId));
    var moveRecord = !practice && (!previousMoves || moves < Number(previousMoves));
    var timeRecord = !practice && (!previousTime || finalSeconds < Number(previousTime));
    var sealed = !practice && evaluateSeal(currentData, moves, finalSeconds);

    if (!practice) {
      if (moveRecord) storageSet(recordKey(playMode, currentId), String(moves));
      if (timeRecord) storageSet(timeKey(playMode, currentId), String(finalSeconds));
      storageSet(doneKey(playMode, currentId), '1');
      if (sealed) storageSet(sealKey(playMode, currentId), '1');
    }

    winLevelEl.textContent = practice ? 'Variação restaurada' : currentData.title;
    winMovesEl.textContent = String(moves);
    winTimeEl.textContent = formatTime(finalSeconds);
    winSealEl.classList.toggle('earned', sealed);
    winSealCodeEl.textContent = practice ? 'MATRIZ LIVRE' : sealed ? 'SELO CONQUISTADO' : 'REGISTRO CONCLUÍDO';
    winSealTitleEl.textContent = practice ? 'Prática concluída' : sealed ? 'Meta respondida' : 'Sequência restaurada';
    winObjectiveEl.textContent = practice ? 'Nenhum recorde oficial foi alterado.' : sealed ? objectiveLabel(currentData) : 'A matriz foi concluída. A meta bônus permanece aberta para uma nova tentativa.';
    winRecordEl.textContent = practice ? 'Variação sem registro.' : moveRecord && timeRecord ? 'Novos recordes de movimentos e tempo.' : moveRecord ? 'Novo recorde de movimentos.' : timeRecord ? 'Novo recorde de tempo.' : 'Registro salvo.';

    var maximum = playMode === 'campaign' ? CONTENT.campaign.length : CONTENT.challenges.length;
    nextEl.hidden = currentId >= maximum;
    nextEl.textContent = playMode === 'campaign' ? 'Próximo capítulo' : 'Próximo desafio';
    show('win');
    buildMenus();
    launchConfetti(sealed);
    playWin(sealed);
  }

  function blueprintSVG(size) {
    var parts = [];
    var inner = 84;
    var origin = 8;
    var step = inner / size;
    var delay = 0;
    parts.push('<svg viewBox="0 0 100 100" role="img" aria-label="Linhas técnicas construindo o tabuleiro">');
    parts.push('<rect class="blueprint-stroke blueprint-frame" x="8" y="8" width="84" height="84" rx="5" style="--bp-delay:0ms"></rect>');
    for (var i = 1; i < size; i += 1) {
      delay += 90;
      var coordinate = (origin + step * i).toFixed(2);
      parts.push('<line class="blueprint-stroke" x1="' + coordinate + '" y1="8" x2="' + coordinate + '" y2="92" style="--bp-delay:' + delay + 'ms"></line>');
      delay += 90;
      parts.push('<line class="blueprint-stroke" x1="8" y1="' + coordinate + '" x2="92" y2="' + coordinate + '" style="--bp-delay:' + delay + 'ms"></line>');
    }
    parts.push('<path class="blueprint-stroke blueprint-corner" d="M4 18V4h14 M82 4h14v14 M96 82v14H82 M18 96H4V82" style="--bp-delay:' + (delay + 100) + 'ms"></path>');
    parts.push('</svg><span class="blueprint-caption">Traçando matriz ' + size + ' × ' + size + ' // verificando encaixes</span>');
    return parts.join('');
  }

  function runBlueprintIntro() {
    blueprintToken += 1;
    var token = blueprintToken;
    locked = true;
    stateEl.textContent = 'ESTADO CONSTRUINDO';
    blueprintIntro.innerHTML = blueprintSVG(SIZE);
    blueprintIntro.hidden = false;
    machineEl.classList.remove('blueprint-reveal');
    machineEl.classList.add('blueprint-building');

    var drawDuration = reducedMotion ? 80 : 2250;
    var totalDuration = reducedMotion ? 130 : 2850;

    window.setTimeout(function () {
      if (token !== blueprintToken) return;
      machineEl.classList.add('blueprint-reveal');
      stateEl.textContent = 'ESTADO PRONTO';
    }, drawDuration);

    window.setTimeout(function () {
      if (token !== blueprintToken) return;
      machineEl.classList.remove('blueprint-building');
      machineEl.classList.remove('blueprint-reveal');
      blueprintIntro.hidden = true;
      locked = false;
      liveEl.textContent = 'Tabuleiro pronto para jogar.';
    }, totalDuration);
  }

  function launchConfetti(sealed) {
    confettiLayer.innerHTML = '';
    if (reducedMotion) return;
    var total = sealed ? 38 : 26;
    var types = ['paper','cyan','line','stamp'];
    for (var i = 0; i < total; i += 1) {
      var piece = document.createElement('span');
      var type = types[i % types.length];
      piece.className = 'confetti-piece confetti-' + type;
      piece.style.setProperty('--confetti-x', (4 + Math.random() * 92) + 'vw');
      piece.style.setProperty('--confetti-delay', (Math.random() * .45) + 's');
      piece.style.setProperty('--confetti-duration', (1.65 + Math.random() * 1.35) + 's');
      piece.style.setProperty('--confetti-drift', ((Math.random() - .5) * 180) + 'px');
      piece.style.setProperty('--confetti-spin', (220 + Math.random() * 620) + 'deg');
      confettiLayer.appendChild(piece);
    }
    window.setTimeout(function () { confettiLayer.innerHTML = ''; }, 3600);
  }

  function audio() {
    if (!audioEnabled) return null;
    if (!audioContext) {
      var Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) return null;
      try { audioContext = new Context(); } catch (error) { return null; }
    }
    if (audioContext.state === 'suspended') audioContext.resume();
    return audioContext;
  }

  function tone(frequency, end, duration, volume, delay) {
    var context = audio();
    if (!context) return;
    var start = context.currentTime + (delay || 0);
    var oscillator = context.createOscillator();
    var gain = context.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(end || frequency, start + duration);
    gain.gain.setValueAtTime(.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + .008);
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + .02);
  }

  function playPress() { tone(720, 590, .03, .008, 0); }
  function playSlide(distance) { tone(330 + distance * 25, 385 + distance * 25, .08, .02, 0); }
  function playButton() { tone(390, 340, .045, .014, 0); }
  function playWin(sealed) {
    var notes = sealed ? [523,659,784,1047,1319] : [523,659,784,1047];
    notes.forEach(function (frequency, index) { tone(frequency, frequency, .13, .018, index * .085); });
  }

  function updateSound() {
    soundEl.textContent = audioEnabled ? 'Som: ligado' : 'Som: desligado';
    soundEl.setAttribute('aria-pressed', audioEnabled ? 'true' : 'false');
    soundEl.classList.toggle('off', !audioEnabled);
  }

  modeCampaign.addEventListener('click', function () { setMenuMode('campaign'); });
  modeChallenges.addEventListener('click', function () { setMenuMode('challenge'); });
  document.getElementById('btnBack').addEventListener('click', function () {
    blueprintToken += 1;
    show('select');
    setMenuMode(playMode);
    buildMenus();
  });
  document.getElementById('btnRestart').addEventListener('click', restart);
  document.getElementById('btnShuffle').addEventListener('click', shufflePractice);
  document.getElementById('btnReplay').addEventListener('click', function () { startEntry(playMode, currentId); });
  document.getElementById('btnNext').addEventListener('click', function () {
    var maximum = playMode === 'campaign' ? CONTENT.campaign.length : CONTENT.challenges.length;
    if (currentId < maximum) startEntry(playMode, currentId + 1);
  });
  document.getElementById('btnMenu').addEventListener('click', function () {
    show('select');
    setMenuMode(playMode);
    buildMenus();
  });
  soundEl.addEventListener('click', function () {
    audioEnabled = !audioEnabled;
    storageSet('dz_audio', audioEnabled ? 'on' : 'off');
    updateSound();
    if (audioEnabled) playButton();
  });

  document.addEventListener('mousemove', function (event) {
    if (drag && drag.mode === 'mouse') moveDrag(event.clientX, event.clientY);
  });
  document.addEventListener('mouseup', function () {
    if (drag && drag.mode === 'mouse') finishDrag(false);
  });
  window.addEventListener('blur', function () {
    if (drag) finishDrag(true);
  });

  document.addEventListener('keydown', function (event) {
    if (!screens.game.classList.contains('active') || locked) return;
    var target = -1;
    if (event.key === 'ArrowLeft' && col(empty) < SIZE - 1) target = empty + 1;
    if (event.key === 'ArrowRight' && col(empty) > 0) target = empty - 1;
    if (event.key === 'ArrowUp' && row(empty) < SIZE - 1) target = empty + SIZE;
    if (event.key === 'ArrowDown' && row(empty) > 0) target = empty - SIZE;
    if (target >= 0) {
      event.preventDefault();
      commit(target);
    }
    if (event.key === 'r' || event.key === 'R') restart();
  });

  function scheduleResize() {
    if (!screens.game.classList.contains('active')) return;
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeBoard, 90);
  }

  window.addEventListener('resize', scheduleResize);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', scheduleResize);

  buildMenus();
  updateSound();
  setMenuMode('campaign');
  show('select');

  var challengeQuery = location.search.match(/[?&]desafio=(\d+)/);
  var levelQuery = location.search.match(/[?&]nivel=(\d+)/);
  if (challengeQuery) startEntry('challenge', Math.min(50, Math.max(1, parseInt(challengeQuery[1], 10))));
  else if (levelQuery) startEntry('campaign', Math.min(10, Math.max(1, parseInt(levelQuery[1], 10))));
}());
