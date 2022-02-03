import { Ball } from './Ball.js';
import * as THREE from '../../libs/three137/three.module.js';
import * as CANNON from '../../libs/cannon-es.js';

class WhiteBall extends Ball{
    constructor(game, x, z){
        super(game, x, z);

        this.forward = new THREE.Vector3();

        this.guideLine = this.createGuideLine();
        game.scene.add(this.guideLine);

        this.dot = this.createIntersectionDot();
        game.scene.add(this.dot);

        this.raycaster = new THREE.Raycaster();

        this.game = game;
    }

    createGuideLine() {
        
    }

    createIntersectionDot() {
        const geometry = new THREE.SphereGeometry(0.01, 4, 4);
        const material = new THREE.MeshBasicMaterial({opacity: 0.5, transparent: true, color: 0xffff00});
        return new THREE.Mesh(geometry, material);
    }

    update(dt) {
        super.update(dt);
      
        //update intersection dot if we're not moving
        if (this.rigidBody.sleepState == CANNON.Body.SLEEPING) {
            this.isSleeping = true;
            this.updateGuideLine();
        } else {
            this.isSleeping = false;
            this.guideLine.visible = false;
            this.dot.visible = false;
        }
    }
        
    updateGuideLine() {
        
    }

    hit(strength) {
        this.rigidBody.wakeUp();
      
        const position = new CANNON.Vec3();
        position.copy(this.rigidBody.position);
        
        const vec = new CANNON.Vec3();
        vec.copy(this.forward);
      
        vec.normalize();
        vec.scale(Ball.RADIUS, vec);
        position.vsub(vec, position);
      
        const force = new CANNON.Vec3();
        force.copy(this.forward.normalize());
        force.scale(strength, force);
        this.rigidBody.applyImpulse(force, new CANNON.Vec3());
    }
      
    //Resets the position to this.startPosition 
    onEnterHole() {
        this.rigidBody.velocity = new CANNON.Vec3(0);
        this.rigidBody.angularVelocity = new CANNON.Vec3(0);
        this.rigidBody.position.copy(this.startPosition);
    }
}

export { WhiteBall };