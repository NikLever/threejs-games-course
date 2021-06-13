import { StrengthBar } from "./StrengthBar.js";

class GameUI{
  constructor() {
    this.strengthBar = new StrengthBar();
  }

  addClass(el, className) {
    if (el.classList) {
      el.classList.add(className);
    } else {
      el.className += ' ' + className;
    }
  }

  removeClass(el, className) {
    if (el.classList) {
      el.classList.remove(className);
    } else {
      el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
  };

  show(elmId) {
    const node = document.getElementById(elmId);
    this.removeClass(node, 'hide');
  }

  hide(elmId) {
    const node = document.getElementById(elmId);
    this.addClass(node, 'hide');
  }

  updateTimer(timerVal) {
    document.getElementsByClassName('timer')[0].textContent = timerVal;
  }

  log(str) {
    const node = document.createElement('li');
    node.textContent = str;
    document.getElementsByClassName('gamelog')[0].appendChild(node);
  }

  updateTurn(str) {
    this.removeClass(document.getElementsByClassName('player1')[0], 'active');
    this.removeClass(document.getElementsByClassName('player2')[0], 'active');
    this.addClass(document.getElementsByClassName(str)[0], 'active');
  }

  updateBalls(ballArr, sides) {
    const p1side = sides.player1 == '?' ? 'unknown' : sides.player1;
    const p2side = sides.player2 == '?' ? 'unknown' : sides.player2;

    this.removeClass(document.getElementsByClassName('player1')[0], 'solid');
    this.removeClass(document.getElementsByClassName('player2')[0], 'solid');
    this.removeClass(document.getElementsByClassName('player1')[0], 'striped');
    this.removeClass(document.getElementsByClassName('player2')[0], 'striped');
    this.removeClass(document.getElementsByClassName('player1')[0], 'unknown');
    this.removeClass(document.getElementsByClassName('player2')[0], 'unknown');
    this.addClass(document.getElementsByClassName('player1')[0], p1side);
    this.addClass(document.getElementsByClassName('player2')[0], p2side);

    if (p1side == 'unknown') return;

    let elem = document.createElement('ul');

    for (let i=1;i<8;i++) {
      const el = document.createElement('li');
      el.textContent = i;
      if (ballArr.indexOf(i) > -1) {

      } else {
        this.addClass(el, 'pocketed');
      }

      elem.appendChild(el);
    }

    document.getElementsByClassName(p1side == 'solid' ? 'player1' : 'player2')[0].replaceChild(elem, document.getElementsByClassName(p1side == 'solid' ? 'player1' : 'player2')[0].children[1]);
    
    elem = document.createElement('ul');

    for (let i=9; i<16; i++) {
      const el = document.createElement('li');
      el.textContent = i;
      if (ballArr.indexOf(i) > -1) {

      } else {
        this.addClass(el, 'pocketed');
      }

      elem.appendChild(el);
    }

    document.getElementsByClassName(p1side == 'striped' ? 'player1' : 'player2')[0].replaceChild(elem, document.getElementsByClassName(p1side == 'striped' ? 'player1' : 'player2')[0].children[1]);
  }

  showGameHud(mode){
    if (mode){
      this.hide('playBtn');
      this.show('player1');
      this.show('player2');
      this.show('timer');
      this.show('gamelog');
    }else{
      this.show('playBtn');
      this.hide('player1');
      this.hide('player2');
      this.hide('timer');
      this.hide('gamelog');
    }
  }

  showMessage(title, body) {
    document.getElementById("message").children[0].textContent = title;
    document.getElementById("message").children[1].textContent = body;
    this.show('message');
  }

  update(){
    if (this.strengthBar.visible) this.strengthBar.update();
  }
}

export { GameUI };
