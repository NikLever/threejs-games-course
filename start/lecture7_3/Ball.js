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

        this.reset();
    }

    hit(strength=0.6) {
      this.rigidBody.wakeUp();
      
      const theta = this.game.controls.getAzimuthalAngle();
      this.tmpQuat.setFromAxisAngle(this.up, theta);

      const forward = this.forward.clone().applyQuaternion(this.tmpQuat);
    
      const force = new CANNON.Vec3();
      force.copy(forward);
      force.scale(strength, force);
      this.rigidBody.applyImpulse(force, new CANNON.Vec3());
  }

    reset(){
      this.rigidBody.velocity = new CANNON.Vec3(0);
      this.rigidBody.angularVelocity = new CANNON.Vec3(0);
      this.rigidBody.position.copy( this.startPosition );
      this.mesh.position.copy( this.startPosition );
      this.mesh.rotation.set(0,0,0);
    }
    
    createBody(x,y,z) {
      const body = new CANNON.Body({
        mass: Ball.MASS, // kg
        position: new CANNON.Vec3(x,y,z), // m
        shape: new CANNON.Sphere(Ball.RADIUS),
        material: Ball.MATERIAL
      });
    
      body.linearDamping = body.angularDamping = 0.5; // Hardcode
      body.allowSleep = true;
    
      // Sleep parameters
      body.sleepSpeedLimit = 2; // Body will feel sleepy if speed< 1 (speed == norm of velocity)
      body.sleepTimeLimit = 0.1; // Body falls asleep after 0.1s of sleepiness
    
      return body;
    }
}

export { Ball };