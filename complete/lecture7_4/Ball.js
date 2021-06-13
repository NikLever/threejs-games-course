import * as THREE from '../../libs/three126/three.module.js';

class Ball{
    static RADIUS = 0.05715 / 2;
    static MASS = 0.17;
    //Ball.contactMaterial = new CANNON.Material("ballMaterial");
  
    constructor(game, x, z, id=0) {
        this.id = id;
    
        this.startPosition = new THREE.Vector3(x, Ball.RADIUS, z);
        this.mesh = this.createMesh(game.scene);
        this.reset();
        
        //this.sphere = new THREE.Sphere(this.mesh.position, Ball.RADIUS); //used for guiding line intersection detecting
        
        //this.rigidBody = this.createBody(x,y,z);
        //world.addBody(this.rigidBody);
        this.name = `ball${id}`;
    }

    reset(){
        this.mesh.position.copy( this.startPosition );
        this.mesh.rotation.set(0,0,0);
        this.fallen = false;
    }
  
    createMesh (scene) {
        const geometry = new THREE.SphereBufferGeometry(Ball.RADIUS, 16, 16);
        const material = new THREE.MeshStandardMaterial({
            metalness: 0.0,
            roughness: 0.1,
            envMap: scene.environment
        });
  
        if (this.id>0){
            const textureLoader = new THREE.TextureLoader().setPath('../../assets/pool-table/').load(`${this.id}ball.png`, tex => {
                material.map = tex;
                material.needsUpdate = true;
            });
        }
  
        const mesh = new THREE.Mesh(geometry, material);
    
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        scene.add(mesh);
    
        return mesh;
    };
 
    update(dt){
        /*this.mesh.position.copy(this.rigidBody.position);
        this.mesh.quaternion.copy(this.rigidBody.quaternion);
      
        // Has the ball fallen into a hole?
        if (this.rigidBody.position.y < -4 * Ball.RADIUS && !this.fallen) {
          this.fallen = true;
          this.onEnterHole();
        }*/
    }
}

export { Ball };

/*
  
  Ball.prototype.onEnterHole = function () {
    this.rigidBody.velocity = new CANNON.Vec3(0);
    this.rigidBody.angularVelocity = new CANNON.Vec3(0);
    world.removeBody(this.rigidBody);
    eightballgame.coloredBallEnteredHole(this.name);
  };
  
  Ball.prototype.createBody = function (x,y,z) {
    var sphereBody = new CANNON.Body({
      mass: Ball.MASS, // kg
      position: new CANNON.Vec3(x,y,z), // m
      shape: new CANNON.Sphere(Ball.RADIUS),
      material: Ball.contactMaterial
    });
  
    sphereBody.linearDamping = sphereBody.angularDamping = 0.5; // Hardcode
    sphereBody.allowSleep = true;
  
    // Sleep parameters
    sphereBody.sleepSpeedLimit = 0.5; // Body will feel sleepy if speed< 0.05 (speed == norm of velocity)
    sphereBody.sleepTimeLimit = 0.1; // Body falls asleep after 1s of sleepiness
  
    return sphereBody;
  };*/