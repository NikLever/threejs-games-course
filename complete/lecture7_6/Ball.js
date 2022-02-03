import * as THREE from '../../libs/three137/three.module.js';
import * as CANNON from '../../libs/cannon-es.js';

class Ball{
    static RADIUS = 0.05715 / 2;
    static MASS = 0.17;
    static MATERIAL = new CANNON.Material("ballMaterial");
    
    constructor(game, x, z, id=0) {
        this.id = id;
    
        this.startPosition = new THREE.Vector3(x, Ball.RADIUS, z);
        this.mesh = this.createMesh(game.scene);
        
        this.world = game.world;
        this.game = game;

        this.rigidBody = this.createBody(x, Ball.RADIUS, z);
        this.world.addBody(this.rigidBody);
        this.reset();

        this.name = `ball${id}`;
    }

    get isSleeping(){
      return this.rigidBody.sleepState == CANNON.Body.SLEEPING;
    }

    reset(){
      this.rigidBody.velocity = new CANNON.Vec3(0);
      this.rigidBody.angularVelocity = new CANNON.Vec3(0);
      this.rigidBody.position.copy( this.startPosition );
      this.world.removeBody(this.rigidBody);
      this.world.addBody(this.rigidBody);
      this.mesh.position.copy( this.startPosition );
      this.mesh.rotation.set(0,0,0);
      this.mesh.visible = true;
      this.fallen = false;
    }

    onEnterHole() {
      this.rigidBody.velocity = new CANNON.Vec3(0);
      this.rigidBody.angularVelocity = new CANNON.Vec3(0);
      this.world.removeBody(this.rigidBody);
      this.fallen = true;
      this.mesh.visible = false;
      this.game.updateUI({event: 'balldrop', id: this.id } );
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

    createMesh (scene) {
        const geometry = new THREE.SphereGeometry(Ball.RADIUS, 16, 16);
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
        if (this.fallen) return;

        this.mesh.position.copy(this.rigidBody.position);
        this.mesh.quaternion.copy(this.rigidBody.quaternion);
      
        // Has the ball fallen into a hole?
        if (this.rigidBody.position.y < -Ball.RADIUS && !this.fallen) {
          this.onEnterHole();
        }
    }
}

export { Ball };