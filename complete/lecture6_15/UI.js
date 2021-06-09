class UI{
    constructor(game){
        const playBtn = document.getElementById('playBtn');
        playBtn.addEventListener('click', this.playBtnPressed.bind(this));

        this.game = game;
    }

    set visible(value){
        const playBtn = document.getElementById('playBtn');
        const ui = document.getElementById('ui');
        const display = (value) ? 'block' : 'none';
        playBtn.style.display = display;
        ui.style.display = display;
    }

    playBtnPressed(){
        const playBtn = document.getElementById('playBtn');
        playBtn.style.display = 'none';
        const img = playBtn.getElementsByTagName('img')[0];
        img.src = '../../assets/factory/playagain.png';
        this.game.startGame();
    }

    showGameover(){
        const gameover = document.getElementById('gameover');
        gameover.style.display = 'block';

        setTimeout(hideGameover, 2000);
        
        function hideGameover(){
            gameover.style.display = 'none';
            const playBtn = document.getElementById('playBtn');
            playBtn.style.display = 'block';
        }
    }

    set ammo(value){
        const progressBar = document.getElementsByName('ammoBar')[0];
        const percent = `${value * 100}%`;
        progressBar.style.width = percent;
    }

    set health(value){
        const progressBar = document.getElementsByName('healthBar')[0];
        const percent = `${value * 100}%`;
        progressBar.style.width = percent;
    }
}

export { UI };