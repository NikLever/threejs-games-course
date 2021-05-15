import { Object3D, Vector3, Quaternion, Raycaster } from '../../libs/three128/three.module.js';
import { JoyStick } from '../../libs/JoyStick.js';
//import { Game } from './Game.js';

class Controller{
    constructor(game){
        this.camera = game.camera;
        this.target = game.user.root;
        this.navmesh = game.navmesh;

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

        this.yAxis = new Vector3(0, 1, 0);
        this.xAxis = new Vector3(1, 0, 0);
        this.forward = new Vector3(0, 0, 1);
        this.down = new Vector3(0, -1, 0);

        this.speed = 3;

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
    }

    onMove( up, right ){
        this.move.up = up;
        this.move.right = -right;
    }

    onLook( up, right ){
        this.look.up = up*0.25;
        this.look.right = -right;
    }

    update(dt=0.0167){   
        let playerMoved = false;

        if (this.move.up!=0){
            const forward = this.forward.clone().applyQuaternion(this.target.quaternion);
            let speed = this.move.up>0 ? this.speed * dt : this.speed * dt * 0.3;
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
            this.camera.position.copy(this.tmpVec3);
        }

        if (this.look.up==0 && this.look.right==0){
            const lerpSpeed = 0.1;
            this.cameraBase.getWorldPosition(this.tmpVec3);
            this.cameraBase.getWorldQuaternion(this.tmpQuat);
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