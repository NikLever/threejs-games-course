import * as THREE from '../../libs/three137/three.module.js';
import * as CANNON from '../../libs/cannon-es.js';


class Ball{
    static RADIUS = 0.05715 / 2;
    static MASS = 0.17;
    static MATERIAL = new CANNON.Material("ballMaterial");
    
    constructor(game, x, z, id=0) {
        this.id = id;
    
        this.startPosition = new THREE.Vector3(x, Ball.RADIUS, z);
        
        this.world = game.world;
        this.game = game;

        this.rigidBody = this.createBody(x, Ball.RADIUS, z);
        this.world.addBody(this.rigidBody);
 
        const color = (id==0) ? 0xFFFFFF : 0xFF0000;
        this.mesh = game.helper.addVisual(this.rigidBody, color);

        this.name = `ball${id}`;

        this.forward = new THREE.Vector3(0,0,-1);
        this.up = new THREE.Vector3(0,1,0);
        this.tmpVec = new THREE.Vector3();
        this.tmpQuat = new THREE.Quaternion();
    }

    hit(strength=0.6) {
    
    }
    
    createBody(x,y,z) {
      
    }
}

export { Ball };