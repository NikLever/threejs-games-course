import { Object3D, Camera, Vector3, Quaternion, Raycaster } from '../../libs/three128/three.module.js';
import { JoyStick } from '../../libs/JoyStick.js';
//import { Game } from './Game.js';

class Controller{
    constructor(game){
        this.camera = game.camera;
        this.clock = game.clock;
        this.user = game.user;
        this.target = game.user.root;
        this.navmesh = game.navmesh;
        this.game = game;

        this.raycaster = new Raycaster();

        this.move = { up:0, right:0 };
        this.look = { up:0, right:0 };

        this.tmpVec3 = new Vector3();
        this.tmpQuat = new Quaternion();

        //Used to return the camera to its base position and orientation after a look event
        this.cameraBase = new Object3D();
        this.cameraBase.position.copy( this.camera.position );
        this.cameraBase.quaternion.copy( this.camera.quaternion );
        this.target.attach( this.cameraBase );

        this.cameraHigh = new Camera();
        this.cameraHigh.position.copy( this.camera.position );
        this.cameraHigh.position.y += 10;
        this.cameraHigh.lookAt( this.target.position );
        this.target.attach( this.cameraHigh );

        this.yAxis = new Vector3(0, 1, 0);
        this.xAxis = new Vector3(1, 0, 0);
        this.forward = new Vector3(0, 0, 1);
        this.down = new Vector3(0, -1, 0);

        this.speed = 5;

        this.checkForGamepad();

        if(true){//'ontouchstart' in document.documentElement){
            const options1 = {
                left: true,
                app: this,
                onMove: this.onMove
            }

            const joystick1 = new JoyStick(options1);

            const options2 = {
                right: true,
                app: this,
                onMove: this.onLook
            }

            const joystick2 = new JoyStick(options2);

            const fireBtn = document.createElement("div");
            fireBtn.style.cssText = "position:absolute; bottom:55px; width:40px; height:40px; background:#FFFFFF; border:#444 solid medium; border-radius:50%; left:50%; transform:translateX(-50%);";
            fireBtn.addEventListener('click', this.fire.bind(this));
            document.body.appendChild(fireBtn);

            this.touchController = { joystick1, joystick2, fireBtn };
        }else{
            document.addEventListener('keydown', this.keyDown.bind(this));
            document.addEventListener('keyup', this.keyUp.bind(this));
            document.addEventListener('mousedown', this.mouseDown.bind(this));
            document.addEventListener('mouseup', this.mouseUp.bind(this));
            document.addEventListener('mousemove', this.mouseMove.bind(this));
        }
    }

    checkForGamepad(){
        const gamepads = {};

        const self = this;

        function gamepadHandler(event, connecting) {
            const gamepad = event.gamepad;

            if (connecting) {
                gamepads[gamepad.index] = gamepad;
                self.gamepad = gamepad;
                if (self.touchController) self.showTouchController(false);
            } else {
                delete self.gamepad;
                delete gamepads[gamepad.index];
                if (self.touchController) self.showTouchController(true);
            }
        }

        window.addEventListener("gamepadconnected", function(e) { gamepadHandler(e, true); }, false);
        window.addEventListener("gamepaddisconnected", function(e) { gamepadHandler(e, false); }, false);
    }

    showTouchController(mode){
        if (this.touchController == undefined) return;

        this.touchController.joystick1.visible = mode;
        this.touchController.joystick2.visible = mode;
        this.touchController.fireBtn.style.display = mode ? 'block' : 'none';
    }

    keyDown(e){
        console.log('keyCode:' + e.keyCode);
    }

    keyUp(e){

    }

    mouseDown(e){

    }

    mouseUp(e){

    }

    mouseMove(e){

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

    readGamepad(){
        const gamepads = navigator.getGamepads();
        const gamepad = gamepads[this.gamepad.index];
        const leftStickX = gamepad.axes[0];
        const leftStickY = gamepad.axes[1];
        const rightStickX = gamepad.axes[2];
        const rightStickY = gamepad.axes[3];
        const fire = gamepad.buttons[7].pressed;
        this.onMove(-leftStickY, leftStickX);
        this.onLook(-rightStickY, rightStickX);
        if (fire) this.fire();
    }

    update(dt=0.0167){   
        let playerMoved = false;
        let speed;

        if (this.gamepad) this.readGamepad();

        if (this.move.up!=0){
            const forward = this.forward.clone().applyQuaternion(this.target.quaternion);
            speed = this.move.up>0 ? this.speed * dt : this.speed * dt * 0.3;
            speed *= this.move.up;
            const pos = this.target.position.clone().add(forward.multiplyScalar(speed));
            pos.y += 2;
            //console.log(`Moving>> target rotation:${this.target.rotation} forward:${forward} pos:${pos}`);
            
            this.raycaster.set( pos, this.down );

            const intersects = this.raycaster.intersectObject( this.navmesh );

            if ( intersects.length>0 ){
                this.target.position.copy(intersects[0].point);
                playerMoved = true;
            }
        } 
        
        if (Math.abs(this.move.right)>0.1){
            const theta = dt * (this.move.right-0.1) * 1;
            this.target.rotateY(theta);
            playerMoved = true;
        }

        if (playerMoved){
            this.cameraBase.getWorldPosition(this.tmpVec3);
            this.camera.position.lerp(this.tmpVec3, 0.7);
            //if (speed) console.log(speed.toFixed(2));
            let run = false;
            if (speed>0.03){
                if (this.overRunSpeedTime){
                    const elapsedTime = this.clock.elapsedTime - this.overRunSpeedTime;
                    run = elapsedTime>0.1;
                }else{
                    this.overRunSpeedTime = this.clock.elapsedTime;
                }
            }else{
                delete this.overRunSpeedTime;
            }
            if (run){
                this.user.action = 'run';    
            }else{
                this.user.action = 'walk';
            }
        }else{
            this.user.action = 'idle';
        }

        if (this.look.up==0 && this.look.right==0){
            let lerpSpeed = 0.7;
            this.cameraBase.getWorldPosition(this.tmpVec3);
            if (this.game.seeUser(this.tmpVec3, true)){
                this.cameraBase.getWorldQuaternion(this.tmpQuat);
                //lerpSpeed = 0.03;
            }else{
                this.cameraHigh.getWorldPosition(this.tmpVec3);
                this.cameraHigh.getWorldQuaternion(this.tmpQuat);
            }
            this.camera.position.lerp(this.tmpVec3, lerpSpeed);
            this.camera.quaternion.slerp(this.tmpQuat, lerpSpeed);
        }else{
            const delta = 1 * dt;
            this.camera.rotateOnWorldAxis(this.yAxis, this.look.right * delta);
            const cameraXAxis = this.xAxis.clone().applyQuaternion(this.camera.quaternion);
            this.camera.rotateOnWorldAxis(cameraXAxis, this.look.up * delta);
        }
    }
}

export { Controller };