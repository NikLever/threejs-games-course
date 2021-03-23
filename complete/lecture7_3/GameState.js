import { GameUI } from './GameUI.js';

class GameState{
    constructor(game)
    {
      this.game = game;
      this.ui = new GameUI();
      this.initGame();
      const btn = document.getElementById('playBtn');
      btn.onclick = this.startGame.bind(this);
      document.addEventListener( 'keydown', this.keydown.bind(this));
      document.addEventListener( 'keyup', this.keyup.bind(this));
    }
  
    startGame(){
      this.ui.hide('playBtn');
      this.ui.show('gameHud');
      this.turn = 'player1';
      this.startTurn();
    }

    keydown( evt ){
      if (this.state !== 'turn') return;

      if (evt.keyCode == 32){
          this.ui.strengthBar.visible = true;
      }
    }

    keyup( evt ){
      if (this.state !== 'turn') return;
      
      if (evt.keyCode == 32){
          this.ui.strengthBar.visible = false;
          this.game.strikeCueball(this.ui.strengthBar.strength);
      }
    }

    initGame(){
      this.numberedBallsOnTable = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
      
      this.turn = 'player1';
      
      this.sides = {
        player1: '?',
        player2: '?'
      };
  
      this.pocketingOccurred = false;
  
      this.state = 'notstarted';
  
      this.ticker = undefined;
    }
  
    startTurn() {
      if (this.state == 'gameover') return;
      // enable movement
      this.timer = 30;
      this.tickTimer();
      this.state = 'turn';
      this.ui.updateTurn(this.turn);
      this.ui.updateBalls(this.numberedBallsOnTable, this.sides);
    }
  
    whiteBallEnteredHole() {
      this.ui.log(`Cue ball pocketed by ${this.turn}!`);
    }
  
    coloredBallEnteredHole(id) {
      if (id === undefined) return;
      
      this.numberedBallsOnTable = this.numberedBallsOnTable.filter( num => {
          return num != id;
      });

      if (id == 0)  return;
  
      if (id == 8) {
        if (this.numberedBallsOnTable.length > 1) {
            this.ui.log(`Game over! 8 ball pocketed too early by ${this.turn}`);
            this.turn = this.turn == 'player1' ? 'player2': 'player1';
        }
  
        this.pocketingOccurred = true;
  
        // Win!
        this.endGame();
    } else {
      if (this.sides.player1 == '?' || this.sides.player2 == '?') {
        this.sides[this.turn] = id < 8 ? 'solid' : 'striped';
        this.sides[this.turn == 'player1' ? 'player2' : 'player1'] = id > 8 ? 'solid' : 'striped';
        this.pocketingOccurred = true;
      } else {
        if ((this.sides[this.turn] == 'solid' && id < 8) || (this.sides[this.turn] == 'striped' && id > 8)) {
          // another turn
          this.pocketingOccurred = true;
        } else {
          this.pocketingOccurred = false;
          this.ui.log(`${this.turn} pocketed opponent's ball!`);
        }
      }
    }
  }
  
  tickTimer() {
    this.ui.updateTimer(this.timer);
    if (this.timer == 0) {
      this.ui.log(`${this.turn} ran out of time`);
      this.state = "outoftime";
      this.switchSides();
    } else {
      this.timer--;
      this.ticker = setTimeout(this.tickTimer.bind(this), 1000);
    }
  }
  
  switchSides() {
    this.turn = this.turn == 'player1' ? 'player2': 'player1';
  
    setTimeout(this.startTurn.bind(this), 1000);
  }
  
  endGame() {
    this.state = 'gameover';
    const winner = this.turn == 'player1' ? 'Player 1' : 'Player 2';
    clearTimeout(this.ticker);
    this.ui.showMessage(`${winner} won!`, 'Thank you for playing');
  }
  
  hit(strength) {
    if (this.game.cueball.rigidBody.sleepState == CANNON.Body.SLEEPING && this.state == 'turn') {
      clearTimeout(this.ticker);
      this.state = 'turnwaiting';
      let tmp = setInterval( () => {
        if (this.game.cueball.rigidBody.sleepState != CANNON.Body.SLEEPING) return;

        for (let i=1; i<this.game.balls.length; i++) {
          if (this.game.balls[i].rigidBody.sleepState != CANNON.Body.SLEEPING && this.numberedBallsOnTable.indexOf(Number(game.balls[i].name.split('ball')[0])) > -1) {
            return;
          }
        }
  
        if (this.pocketingOccurred) {
          setTimeout(this.startTurn.bind(this), 1000);
        } else {
          this.switchSides();
        }
  
        this.pocketingOccurred = false;
  
        clearInterval(tmp);
      }, 30);
    }
  }

  update(dt){
    this.ui.update();
  }
}

export { GameState };