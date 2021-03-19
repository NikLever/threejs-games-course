var GameGui = function () {
  var btn_ball = document.getElementById('btn_ball');
  btn_ball.onclick = function () {
    eightballgame.hitButtonClicked(Number(document.getElementById('range_strength').value));
  };
  if (debug) document.getElementById('fps_stats_container').appendChild( stats.domElement );
};

GameGui.prototype.setupGameHud = function() {
  this.hide(document.getElementById('mainMenu'));
  this.show(document.getElementById('controlsHud'));
};

GameGui.addClass = function (el, className) {
  if (el.classList) {
    el.classList.add(className);
  } else {
    el.className += ' ' + className;
  }
};

GameGui.removeClass = function (el, className) {
  if (el.classList) {
    el.classList.remove(className);
  } else {
    el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
  }
};

GameGui.prototype.show = function (node) {
  GameGui.removeClass(node, 'hide');
};

GameGui.prototype.hide = function (node) {
  GameGui.addClass(node, 'hide');
};

GameGui.prototype.play8BallClicked = function () {
  eightballgame = new EightBallGame();
};

GameGui.prototype.UpdateTimer = function(timerVal) {
  document.getElementsByClassName('timer')[0].textContent = timerVal;
};

GameGui.prototype.log = function(str) {
  var node = document.createElement('li');
  node.textContent = str;
  document.getElementsByClassName('gamelog')[0].appendChild(node);
};

GameGui.prototype.updateTurn = function(str) {
  GameGui.removeClass(document.getElementsByClassName('player1')[0], 'active');
  GameGui.removeClass(document.getElementsByClassName('player2')[0], 'active');
  GameGui.addClass(document.getElementsByClassName(str)[0], 'active');
};

GameGui.prototype.updateBalls = function(ballArr, p1side, p2side) {
  p1side = p1side == '?' ? 'unknown' : p1side;
  p2side = p2side == '?' ? 'unknown' : p2side;

  GameGui.removeClass(document.getElementsByClassName('player1')[0], 'solid');
  GameGui.removeClass(document.getElementsByClassName('player2')[0], 'solid');
  GameGui.removeClass(document.getElementsByClassName('player1')[0], 'striped');
  GameGui.removeClass(document.getElementsByClassName('player2')[0], 'striped');
  GameGui.removeClass(document.getElementsByClassName('player1')[0], 'unknown');
  GameGui.removeClass(document.getElementsByClassName('player2')[0], 'unknown');
  GameGui.addClass(document.getElementsByClassName('player1')[0], p1side);
  GameGui.addClass(document.getElementsByClassName('player2')[0], p2side);

  if (p1side == 'unknown') {
    return;
  }

  var elem = document.createElement('ul');
  for (var i=1;i<8;i++) {
    var el = document.createElement('li');
    el.textContent = i;
    if (ballArr.indexOf(i) > -1) {

    } else {
      GameGui.addClass(el, 'pocketed');
    }

    elem.appendChild(el);
  }
  document.getElementsByClassName(p1side == 'solid' ? 'player1' : 'player2')[0].replaceChild(elem, document.getElementsByClassName(p1side == 'solid' ? 'player1' : 'player2')[0].children[1]);
  elem = document.createElement('ul');
  for (var i=9;i<16;i++) {
    var el = document.createElement('li');
    el.textContent = i;
    if (ballArr.indexOf(i) > -1) {

    } else {
      GameGui.addClass(el, 'pocketed');
    }

    elem.appendChild(el);
  }
  document.getElementsByClassName(p1side == 'striped' ? 'player1' : 'player2')[0].replaceChild(elem, document.getElementsByClassName(p1side == 'striped' ? 'player1' : 'player2')[0].children[1]);
};

GameGui.prototype.showEndGame = function(str) {
  document.getElementById("gameover").children[0].textContent = str + " won!";
  this.show(document.getElementById('gameover'));
}
