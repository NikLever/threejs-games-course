import { Object3D, Camera, Vector3, Quaternion, Raycaster } from '../../libs/three137/three.module.js';
import { JoyStick } from '../../libs/JoyStick.js';
//import { Game } from './Game.js';

class Controller{
    constructor(game){
        
    }

    initOnscreenController(){
        
    }

    initKeyboardControl(){
        
    }

    checkForGamepad(){
        
    }

    showTouchController(mode){
        if (this.touchController == undefined) return;

        this.touchController.joystick1.visible = mode;
        this.touchController.joystick2.visible = mode;
        this.touchController.fireBtn.style.display = mode ? 'block' : 'none';
    }

    keyDown(e){
        //console.log('keyCode:' + e.keyCode);
        switch(e.keyCode){
            case 87:
                this.keys.w = true;
                break;
            case 65:
                this.keys.a = true;
                break;
            case 83:
                this.keys.s = true;
                break;
            case 68:
                this.keys.d = true;
                break;
            case 32:
                this.fire();
                break;                                           
        }
    }

    keyUp(e){
        switch(e.keyCode){
            case 87:
                this.keys.w = false;
                if (!this.keys.s) this.move.up = 0;
                break;
            case 65:
                this.keys.a = false;
                if (!this.keys.d) this.move.right = 0;
                break;
            case 83:
                this.keys.s = false;
                if (!this.keys.w) this.move.up = 0;
                break;
            case 68:
                this.keys.d = false;
                if (!this.keys.a) this.move.right = 0;
                break;                             
        }
    }

    mouseDown(e){
        this.keys.mousedown = true;
        this.keys.mouseorigin.x = e.offsetX;
        this.keys.mouseorigin.y = e.offsetY;
    }

    mouseUp(e){
        this.keys.mousedown = false;
        this.look.up = 0;
        this.look.right = 0;
    }

    mouseMove(e){
        if (!this.keys.mousedown) return;
        let offsetX = e.offsetX - this.keys.mouseorigin.x;
        let offsetY = e.offsetY - this.keys.mouseorigin.y;
        if (offsetX<-100) offsetX = -100;
        if (offsetX>100) offsetX = 100;
        offsetX /= 100;
        if (offsetY<-100) offsetY = -100;
        if (offsetY>100) offsetY = 100;
        offsetY /= 100;
        this.onLook(-offsetY, offsetX);
    }

    fire(){
        console.log("Fire");
    }

    onMove( up, right ){
        this.move.up = up;
        this.move.right = -right;
    }

    onLook( up, right ){
        this.look.up = up*0.25;
        this.look.right = -right;
    }

    gamepadHandler(){
        
    }

    keyHandler(){
        
    }

    update(dt=0.0167){   
        
    }
}

export { Controller };