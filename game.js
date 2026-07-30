(function () {
  'use strict';

  var SIZE = 4;
  var SOLVED = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0];
  var LEVELS = window.DIRLIZANU_LEVELS || [];
  var MOVE_MS = 190;
  var screens = {
    select: document.getElementById('screen-select'),
    game: document.getElementById('screen-game'),
    win: document.getElementById('screen-win')
  };
  var levelsGrid = document.getElementById('levelsGrid');
  var boardArea = document.getElementById('boardArea');
  var boardEl = document.getElementById('board');
  var boardShell = document.getElementById('boardShell');
  var levelEl = document.getElementById('gameLevel');
  var diffEl = document.getElementById('gameDifficulty');
  var matrixEl = document.getElementById('gameMatrix');
  var movesEl = document.getElementById('statMoves');
  var timeEl = document.getElementById('statTime');
  var soundEl = document.getElementById('soundToggle');
  var liveEl = document.getElementById('gameLive');
  var winLevelEl = document.getElementById('winLevel');
  var winMovesEl = document.getElementById('winMoves');
  var winTimeEl = document.getElementById('winTime');
  var winRecordEl = document.getElementById('winRecord');
  var nextEl = document.getElementById('btnNext');

  var level = 1;
  var board = SOLVED.slice();
  var initialBoard = SOLVED.slice();
  var empty = 15;
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

  function storageGet(key) {
    try { return localStorage.getItem(key); } catch (error) { return null; }
  }

  function storageSet(key, value) {
    try { localStorage.setItem(key, value); } catch (error) {}
  }

  function row(index) { return Math.floor(index / SIZE); }
  function col(index) { return index % SIZE; }

  function tierFor(value) {
    if (value <= 10) return { name: 'Iniciante', cls: 'easy', stars: '★☆☆☆', min: 8, max: 19 };
    if (value <= 20) return { name: 'Médio', cls: 'medium', stars: '★★☆☆', min: 21, max: 32 };
    if (value <= 30) return { name: 'Difícil', cls: 'hard', stars: '★★★☆', min: 33, max: 44 };
    return { name: 'Especialista', cls: 'expert', stars: '★★★★', min: 45, max: 58 };
  }

  function show(name) {
    Object.keys(screens).forEach(function (key) {
      var active = key === name;
      screens[key].classList.toggle('active', active);
      screens[key].setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    if (name !== 'game') stopTimer();
  }

  function formatTime(seconds) {
    var minutes = Math.floor(seconds / 60);
    var rest = seconds % 60;
    return minutes + ':' + (rest < 10 ? '0' : '') + rest;
  }

  function currentElapsed() {
    return startedAt ? elapsed + Math.floor((Date.now() - startedAt) / 1000) : elapsed;
  }

  function updateStats() {
    movesEl.textContent = String(moves);
    timeEl.textContent = formatTime(currentElapsed());
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

  function buildMenu() {
    levelsGrid.innerHTML = '';
    [1,11,21,31].forEach(function (start) {
      var tier = tierFor(start);
      var section = document.createElement('section');
      var heading = document.createElement('div');
      var grid = document.createElement('div');
      section.className = 'tier-group';
      heading.className = 'section-label';
      heading.innerHTML = '<span>' + tier.name + '</span><small>Níveis ' + start + '–' + (start + 9) + '</small>';
      grid.className = 'levels-grid';

      for (var number = start; number < start + 10; number += 1) {
        grid.appendChild(levelButton(number));
      }
      section.appendChild(heading);
      section.appendChild(grid);
      levelsGrid.appendChild(section);
    });
  }

  function levelButton(number) {
    var button = document.createElement('button');
    var tier = tierFor(number);
    var data = LEVELS[number - 1];
    var best = storageGet('sp_melhor_' + number);
    var done = storageGet('sp_feito_' + number);
    button.type = 'button';
    button.className = 'level-card ' + tier.cls;
    button.setAttribute('aria-label', 'Nível ' + number + ', ' + tier.name + (done ? ', concluído' : '') + (best ? ', recorde ' + best : ''));
    button.innerHTML =
      '<span class="level-status" aria-hidden="true">' + (done ? '✓' : '—') + '</span>' +
      '<span class="level-number">' + number + '</span>' +
      '<span class="level-name">' + tier.name + '</span>' +
      '<span class="level-score">Índice ' + data.score + '</span>' +
      '<span class="level-best">' + (best ? 'Recorde ' + best : 'Sem registro') + '</span>';
    button.addEventListener('click', function () { playButton(); startLevel(number); });
    return button;
  }

  function createBoardDOM() {
    var slotsLayer = document.createElement('div');
    var tilesLayer = document.createElement('div');
    boardEl.innerHTML = '';
    slotsLayer.className = 'slots-layer';
    slotsLayer.setAttribute('aria-hidden', 'true');
    tilesLayer.className = 'tiles-layer';

    for (var index = 0; index < 16; index += 1) {
      var slot = document.createElement('div');
      slot.className = 'slot';
      slotsLayer.appendChild(slot);
      slots.push(slot);
    }

    for (var value = 1; value <= 15; value += 1) {
      var tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'tile';
      tile.dataset.value = String(value);
      tile.innerHTML = '<span class="tile-registration" aria-hidden="true"></span><span class="tile-number">' + value + '</span>';
      attachTile(tile, value);
      tiles[value] = tile;
      tilesLayer.appendChild(tile);
    }
    boardEl.appendChild(slotsLayer);
    boardEl.appendChild(tilesLayer);
  }

  function linePath(index) {
    if (index === empty || index < 0) return null;
    var step;
    if (row(index) === row(empty)) step = index > empty ? 1 : -1;
    else if (col(index) === col(empty)) step = index > empty ? 4 : -4;
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
    var size = Math.max(250, Math.min(boardArea.clientWidth, 520));
    gap = Math.max(6, Math.min(11, Math.round(size * .021)));
    tileSize = Math.floor((size - gap * 5) / 4);
    pitch = tileSize + gap;
    size = tileSize * 4 + gap * 5;
    boardEl.style.width = size + 'px';
    boardEl.style.height = size + 'px';
    boardShell.style.width = size + 'px';
    slots.forEach(function (slot, index) {
      slot.style.width = tileSize + 'px';
      slot.style.height = tileSize + 'px';
      place(slot, index);
    });
    Object.keys(tiles).forEach(function (key) {
      tiles[key].style.width = tileSize + 'px';
      tiles[key].style.height = tileSize + 'px';
      tiles[key].style.fontSize = Math.round(tileSize * .36) + 'px';
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
      tile.classList.toggle('hero-tile', value === 15);
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
    for (var i = 0; i < 16; i += 1) if (board[i] !== SOLVED[i]) return false;
    return true;
  }

  function commit(index, suppliedPath, fromDrag) {
    if (locked) return false;
    var path = suppliedPath || linePath(index);
    if (!path || path.length < 2) return false;
    startTimer();
    locked = true;
    mutate(path);
    moves += path.length - 1;
    if (!fromDrag) render(true);
    playSlide(path.length - 1);
    liveEl.textContent = (path.length - 1) + ' peça(s) deslizada(s).';
    window.setTimeout(function () {
      locked = false;
      if (solved()) completeLevel();
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
        if (drag) {
          try { tile.setPointerCapture(event.pointerId); } catch (error) {}
          event.preventDefault();
        }
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
      var el = tiles[board[path[i]]];
      var base = position(path[i]);
      el.classList.add('dragging');
      elements.push({ el: el, x: base.x, y: base.y });
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
    if (success) {
      suppressClick = true;
      window.setTimeout(function () { suppressClick = false; }, 260);
      mutate(state.path);
      startTimer();
      moves += state.path.length - 1;
      locked = true;
      playSlide(state.path.length - 1);
      requestAnimationFrame(function () {
        render(true);
        window.setTimeout(function () {
          locked = false;
          if (solved()) completeLevel();
        }, reducedMotion ? 10 : MOVE_MS + 35);
      });
    } else render(true);
  }

  document.addEventListener('mousemove', function (event) {
    if (drag && drag.mode === 'mouse') moveDrag(event.clientX, event.clientY);
  });
  document.addEventListener('mouseup', function () {
    if (drag && drag.mode === 'mouse') finishDrag(false);
  });

  function startLevel(number) {
    var data = LEVELS[number - 1];
    var tier = tierFor(number);
    level = number;
    board = data.board.slice();
    initialBoard = data.board.slice();
    empty = board.indexOf(0);
    moves = 0;
    locked = false;
    practice = false;
    resetTimer();
    levelEl.textContent = 'Nível ' + number + ' de 40';
    diffEl.textContent = tier.stars + '  ' + tier.name;
    diffEl.className = 'game-difficulty ' + tier.cls;
    matrixEl.textContent = 'Matriz oficial · índice ' + data.score;
    show('game');
    requestAnimationFrame(function () { resizeBoard(); });
  }

  function restart() {
    board = initialBoard.slice();
    empty = board.indexOf(0);
    moves = 0;
    locked = false;
    resetTimer();
    render(false);
    playButton();
  }

  function shufflePractice() {
    var tier = tierFor(level);
    var target = LEVELS[level - 1].score;
    board = calibratedBoard(target, tier.min, tier.max);
    initialBoard = board.slice();
    empty = board.indexOf(0);
    moves = 0;
    locked = false;
    practice = true;
    resetTimer();
    matrixEl.textContent = 'Matriz livre · sem recorde';
    render(false);
    playButton();
  }

  function calibratedBoard(target, minimum, maximum) {
    var best = null;
    var bestDistance = Infinity;
    for (var attempt = 0; attempt < 420; attempt += 1) {
      var candidate = randomWalk(45 + target * 5 + (attempt % 17) * 3);
      var score = heuristic(candidate);
      var distance = Math.abs(score - target);
      if (score >= minimum && score <= maximum && distance < bestDistance) {
        best = candidate;
        bestDistance = distance;
        if (distance <= 1) break;
      }
    }
    return best || randomWalk(160);
  }

  function randomWalk(steps) {
    var result = SOLVED.slice();
    var hole = 15;
    var previous = -1;
    for (var i = 0; i < steps; i += 1) {
      var choices = [];
      if (row(hole) > 0) choices.push(hole - 4);
      if (row(hole) < 3) choices.push(hole + 4);
      if (col(hole) > 0) choices.push(hole - 1);
      if (col(hole) < 3) choices.push(hole + 1);
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
    return score;
  }

  function completeLevel() {
    stopTimer();
    var previous = storageGet('sp_melhor_' + level);
    var record = !practice && (!previous || moves < Number(previous));
    if (!practice) {
      if (record) storageSet('sp_melhor_' + level, String(moves));
      storageSet('sp_feito_' + level, '1');
    }
    winLevelEl.textContent = practice ? 'Matriz livre restaurada' : 'Nível ' + level + ' restaurado';
    winMovesEl.textContent = String(moves);
    winTimeEl.textContent = formatTime(currentElapsed());
    winRecordEl.textContent = practice ? 'Matriz de prática: nenhum recorde oficial foi alterado.' : record ? 'Novo recorde registrado.' : previous ? 'Seu recorde permanece em ' + previous + ' movimentos.' : '';
    nextEl.hidden = level >= 40;
    show('win');
    buildMenu();
    playWin();
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
  function playWin() { [523,659,784,1047].forEach(function (f, i) { tone(f, f, .13, .018, i * .085); }); }

  function updateSound() {
    soundEl.textContent = audioEnabled ? 'Som: ligado' : 'Som: desligado';
    soundEl.setAttribute('aria-pressed', audioEnabled ? 'true' : 'false');
    soundEl.classList.toggle('off', !audioEnabled);
  }

  document.getElementById('btnBack').addEventListener('click', function () { show('select'); buildMenu(); });
  document.getElementById('btnRestart').addEventListener('click', restart);
  document.getElementById('btnShuffle').addEventListener('click', shufflePractice);
  document.getElementById('btnReplay').addEventListener('click', function () { startLevel(level); });
  document.getElementById('btnNext').addEventListener('click', function () { if (level < 40) startLevel(level + 1); });
  document.getElementById('btnMenu').addEventListener('click', function () { show('select'); buildMenu(); });
  soundEl.addEventListener('click', function () {
    audioEnabled = !audioEnabled;
    storageSet('dz_audio', audioEnabled ? 'on' : 'off');
    updateSound();
    if (audioEnabled) playButton();
  });

  document.addEventListener('keydown', function (event) {
    if (!screens.game.classList.contains('active') || locked) return;
    var target = -1;
    if (event.key === 'ArrowLeft' && col(empty) < 3) target = empty + 1;
    if (event.key === 'ArrowRight' && col(empty) > 0) target = empty - 1;
    if (event.key === 'ArrowUp' && row(empty) < 3) target = empty + 4;
    if (event.key === 'ArrowDown' && row(empty) > 0) target = empty - 4;
    if (target >= 0) { event.preventDefault(); commit(target); }
    if (event.key === 'r' || event.key === 'R') restart();
  });

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    if (!screens.game.classList.contains('active')) return;
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeBoard, 90);
  });

  createBoardDOM();
  buildMenu();
  updateSound();
  show('select');
  var queryLevel = location.search.match(/[?&]nivel=(\d+)/);
  if (queryLevel) startLevel(Math.min(40, Math.max(1, parseInt(queryLevel[1], 10))));
}());
