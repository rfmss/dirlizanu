(function (root, factory) {
  'use strict';
  var payload = factory();
  if (typeof module === 'object' && module.exports) module.exports = payload;
  else root.DIRLIZANU_CONTENT = payload;
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var specs = {"campaign":[{"id":1,"size":4,"title":"Primeiro traço","description":"Aprenda o campo sem pressa.","seed":692572761,"walk":30,"score":16,"objective":{"type":"classic"}},{"id":2,"size":4,"title":"Linha de força","description":"A sequência começa a resistir.","seed":596026421,"walk":38,"score":18,"objective":{"type":"moves","moves":84}},{"id":3,"size":4,"title":"Encaixe oculto","description":"O vazio muda de eixo.","seed":16273016,"walk":43,"score":25,"objective":{"type":"time","seconds":168}},{"id":4,"size":4,"title":"Campo tenso","description":"A última matriz compacta.","seed":1010921,"walk":944,"score":34,"objective":{"type":"moves","moves":134}},{"id":5,"size":5,"title":"Placa ampliada","description":"O aparato cresce para 5 × 5.","seed":836602804,"walk":194,"score":38,"objective":{"type":"classic"}},{"id":6,"size":5,"title":"Quinta coluna","description":"Mais espaço, menos atalhos.","seed":175824584,"walk":192,"score":46,"objective":{"type":"moves","moves":201}},{"id":7,"size":5,"title":"Ruído de registro","description":"A ordem se esconde nas bordas.","seed":128356969,"walk":230,"score":58,"objective":{"type":"time","seconds":377}},{"id":8,"size":5,"title":"Matriz profunda","description":"Cada linha cobra memória.","seed":27267309,"walk":2962,"score":70,"objective":{"type":"hybrid","moves":287,"seconds":439}},{"id":9,"size":5,"title":"Pressão máxima","description":"Pouco vazio para muita matéria.","seed":4405155,"walk":2414,"score":84,"objective":{"type":"time","seconds":512}},{"id":10,"size":5,"title":"Arquivo mestre","description":"Restaure a placa final.","seed":533424406,"walk":2582,"score":100,"objective":{"type":"hybrid","moves":395,"seconds":595}}],"challenges":[{"id":1,"series":"A","size":4,"title":"Desafio 01","description":"Restaure sem limite adicional.","seed":2017777844,"walk":36,"score":16,"objective":{"type":"classic"}},{"id":2,"series":"A","size":4,"title":"Desafio 02","description":"Busque o selo de precisão.","seed":115356608,"walk":39,"score":19,"objective":{"type":"moves","moves":87}},{"id":3,"series":"A","size":4,"title":"Desafio 03","description":"Busque o selo de tempo.","seed":739492760,"walk":31,"score":19,"objective":{"type":"time","seconds":142}},{"id":4,"series":"A","size":4,"title":"Desafio 04","description":"Tempo e precisão no mesmo registro.","seed":314446584,"walk":42,"score":20,"objective":{"type":"hybrid","moves":90,"seconds":146}},{"id":5,"series":"A","size":4,"title":"Desafio 05","description":"Restaure sem limite adicional.","seed":96870057,"walk":32,"score":22,"objective":{"type":"classic"}},{"id":6,"series":"A","size":4,"title":"Desafio 06","description":"Busque o selo de precisão.","seed":44556869,"walk":42,"score":24,"objective":{"type":"moves","moves":103}},{"id":7,"series":"A","size":4,"title":"Desafio 07","description":"Busque o selo de tempo.","seed":115526552,"walk":650,"score":26,"objective":{"type":"time","seconds":172}},{"id":8,"series":"A","size":4,"title":"Desafio 08","description":"Tempo e precisão no mesmo registro.","seed":145321375,"walk":244,"score":28,"objective":{"type":"hybrid","moves":115,"seconds":181}},{"id":9,"series":"A","size":4,"title":"Desafio 09","description":"Restaure sem limite adicional.","seed":16951624,"walk":44,"score":30,"objective":{"type":"classic"}},{"id":10,"series":"A","size":4,"title":"Desafio 10","description":"Busque o selo de precisão.","seed":3254574,"walk":690,"score":32,"objective":{"type":"moves","moves":128}},{"id":11,"series":"B","size":4,"title":"Desafio 11","description":"Busque o selo de tempo.","seed":10763958,"walk":460,"score":34,"objective":{"type":"time","seconds":207}},{"id":12,"series":"B","size":4,"title":"Desafio 12","description":"Tempo e precisão no mesmo registro.","seed":11024556,"walk":618,"score":36,"objective":{"type":"hybrid","moves":140,"seconds":215}},{"id":13,"series":"B","size":4,"title":"Desafio 13","description":"Restaure sem limite adicional.","seed":16880215,"walk":670,"score":38,"objective":{"type":"classic"}},{"id":14,"series":"B","size":4,"title":"Desafio 14","description":"Busque o selo de precisão.","seed":4423631,"walk":104,"score":40,"objective":{"type":"moves","moves":152}},{"id":15,"series":"B","size":4,"title":"Desafio 15","description":"Busque o selo de tempo.","seed":31085065,"walk":128,"score":42,"objective":{"type":"time","seconds":241}},{"id":16,"series":"B","size":4,"title":"Desafio 16","description":"Tempo e precisão no mesmo registro.","seed":32081936,"walk":820,"score":44,"objective":{"type":"hybrid","moves":165,"seconds":250}},{"id":17,"series":"B","size":4,"title":"Desafio 17","description":"Restaure sem limite adicional.","seed":3435342,"walk":144,"score":46,"objective":{"type":"classic"}},{"id":18,"series":"B","size":4,"title":"Desafio 18","description":"Busque o selo de precisão.","seed":19044646,"walk":770,"score":48,"objective":{"type":"moves","moves":177}},{"id":19,"series":"B","size":4,"title":"Desafio 19","description":"Busque o selo de tempo.","seed":677209719,"walk":796,"score":52,"objective":{"type":"time","seconds":284}},{"id":20,"series":"B","size":4,"title":"Desafio 20","description":"Tempo e precisão no mesmo registro.","seed":2020451285,"walk":618,"score":56,"objective":{"type":"hybrid","moves":202,"seconds":301}},{"id":21,"series":"C","size":5,"title":"Desafio 21","description":"Restaure sem limite adicional.","seed":1311743165,"walk":96,"score":34,"objective":{"type":"classic"}},{"id":22,"series":"C","size":5,"title":"Desafio 22","description":"Busque o selo de precisão.","seed":348248686,"walk":151,"score":39,"objective":{"type":"moves","moves":176}},{"id":23,"series":"C","size":5,"title":"Desafio 23","description":"Busque o selo de tempo.","seed":491238810,"walk":98,"score":42,"objective":{"type":"time","seconds":294}},{"id":24,"series":"C","size":5,"title":"Desafio 24","description":"Tempo e precisão no mesmo registro.","seed":604057099,"walk":104,"score":46,"objective":{"type":"hybrid","moves":201,"seconds":315}},{"id":25,"series":"C","size":5,"title":"Desafio 25","description":"Restaure sem limite adicional.","seed":7183238,"walk":188,"score":50,"objective":{"type":"classic"}},{"id":26,"series":"C","size":5,"title":"Desafio 26","description":"Busque o selo de precisão.","seed":41308269,"walk":1178,"score":54,"objective":{"type":"moves","moves":230}},{"id":27,"series":"C","size":5,"title":"Desafio 27","description":"Busque o selo de tempo.","seed":148131305,"walk":190,"score":58,"objective":{"type":"time","seconds":377}},{"id":28,"series":"C","size":5,"title":"Desafio 28","description":"Tempo e precisão no mesmo registro.","seed":42903378,"walk":340,"score":62,"objective":{"type":"hybrid","moves":259,"seconds":398}},{"id":29,"series":"C","size":5,"title":"Desafio 29","description":"Restaure sem limite adicional.","seed":145702948,"walk":504,"score":66,"objective":{"type":"classic"}},{"id":30,"series":"C","size":5,"title":"Desafio 30","description":"Busque o selo de precisão.","seed":65208865,"walk":1004,"score":70,"objective":{"type":"moves","moves":287}},{"id":31,"series":"D","size":5,"title":"Desafio 31","description":"Busque o selo de tempo.","seed":21654290,"walk":2218,"score":74,"objective":{"type":"time","seconds":460}},{"id":32,"series":"D","size":5,"title":"Desafio 32","description":"Tempo e precisão no mesmo registro.","seed":5705419,"walk":670,"score":78,"objective":{"type":"hybrid","moves":316,"seconds":481}},{"id":33,"series":"D","size":5,"title":"Desafio 33","description":"Restaure sem limite adicional.","seed":15995397,"walk":1726,"score":82,"objective":{"type":"classic"}},{"id":34,"series":"D","size":5,"title":"Desafio 34","description":"Busque o selo de precisão.","seed":8228225,"walk":764,"score":86,"objective":{"type":"moves","moves":345}},{"id":35,"series":"D","size":5,"title":"Desafio 35","description":"Busque o selo de tempo.","seed":52915084,"walk":514,"score":90,"objective":{"type":"time","seconds":543}},{"id":36,"series":"D","size":5,"title":"Desafio 36","description":"Tempo e precisão no mesmo registro.","seed":38362168,"walk":2666,"score":92,"objective":{"type":"hybrid","moves":367,"seconds":554}},{"id":37,"series":"D","size":5,"title":"Desafio 37","description":"Restaure sem limite adicional.","seed":56082616,"walk":1110,"score":94,"objective":{"type":"classic"}},{"id":38,"series":"D","size":5,"title":"Desafio 38","description":"Busque o selo de precisão.","seed":212052629,"walk":1874,"score":96,"objective":{"type":"moves","moves":381}},{"id":39,"series":"D","size":5,"title":"Desafio 39","description":"Busque o selo de tempo.","seed":5956066,"walk":2986,"score":98,"objective":{"type":"time","seconds":585}},{"id":40,"series":"D","size":5,"title":"Desafio 40","description":"Tempo e precisão no mesmo registro.","seed":321089921,"walk":2116,"score":98,"objective":{"type":"hybrid","moves":388,"seconds":585}},{"id":41,"series":"E","size":5,"title":"Desafio 41","description":"Restaure sem limite adicional.","seed":460957240,"walk":2211,"score":99,"objective":{"type":"classic"}},{"id":42,"series":"E","size":5,"title":"Desafio 42","description":"Busque o selo de precisão.","seed":1543838024,"walk":2613,"score":99,"objective":{"type":"moves","moves":392}},{"id":43,"series":"E","size":5,"title":"Desafio 43","description":"Busque o selo de tempo.","seed":1581532645,"walk":1207,"score":99,"objective":{"type":"time","seconds":590}},{"id":44,"series":"E","size":5,"title":"Desafio 44","description":"Tempo e precisão no mesmo registro.","seed":1967404112,"walk":1205,"score":99,"objective":{"type":"hybrid","moves":392,"seconds":590}},{"id":45,"series":"E","size":5,"title":"Desafio 45","description":"Restaure sem limite adicional.","seed":2015853302,"walk":2043,"score":99,"objective":{"type":"classic"}},{"id":46,"series":"E","size":5,"title":"Desafio 46","description":"Busque o selo de precisão.","seed":2058163453,"walk":1309,"score":99,"objective":{"type":"moves","moves":392}},{"id":47,"series":"E","size":5,"title":"Desafio 47","description":"Busque o selo de tempo.","seed":2104048157,"walk":619,"score":99,"objective":{"type":"time","seconds":590}},{"id":48,"series":"E","size":5,"title":"Desafio 48","description":"Tempo e precisão no mesmo registro.","seed":946992747,"walk":1216,"score":100,"objective":{"type":"hybrid","moves":395,"seconds":595}},{"id":49,"series":"E","size":5,"title":"Desafio 49","description":"Restaure sem limite adicional.","seed":1074597662,"walk":1775,"score":101,"objective":{"type":"classic"}},{"id":50,"series":"E","size":5,"title":"Desafio 50","description":"Busque o selo de precisão.","seed":1723225787,"walk":2971,"score":105,"objective":{"type":"moves","moves":413}}]};

  function prng(seed) {
    return function () {
      seed |= 0;
      seed = seed + 0x6D2B79F5 | 0;
      var value = Math.imul(seed ^ seed >>> 15, 1 | seed);
      value = value + Math.imul(value ^ value >>> 7, 61 | value) ^ value;
      return ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
  }

  function solved(size) {
    var board = [];
    for (var value = 1; value < size * size; value += 1) board.push(value);
    board.push(0);
    return board;
  }

  function generate(size, steps, seed) {
    var random = prng(seed);
    var board = solved(size);
    var empty = board.length - 1;
    var previous = -1;
    for (var turn = 0; turn < steps; turn += 1) {
      var row = Math.floor(empty / size);
      var column = empty % size;
      var choices = [];
      if (row > 0) choices.push(empty - size);
      if (row < size - 1) choices.push(empty + size);
      if (column > 0) choices.push(empty - 1);
      if (column < size - 1) choices.push(empty + 1);
      var filtered = choices.filter(function (choice) { return choice !== previous; });
      if (!filtered.length) filtered = choices;
      var next = filtered[Math.floor(random() * filtered.length)];
      board[empty] = board[next];
      board[next] = 0;
      previous = empty;
      empty = next;
    }
    return board;
  }

  function materialize(entry) {
    var copy = {};
    Object.keys(entry).forEach(function (key) { copy[key] = entry[key]; });
    copy.board = generate(copy.size, copy.walk, copy.seed);
    return copy;
  }

  return {
    version: 2,
    campaign: specs.campaign.map(materialize),
    challenges: specs.challenges.map(materialize)
  };
}));
