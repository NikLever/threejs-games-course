import * as THREE from '../../libs/three137/three.module.js';
import * as CANNON from '../../libs/cannon-es.js';
import { CannonHelper  } from '../../libs/CannonHelper.js';
import { Table } from './Table.js';
import { Ball } from './Ball.js';
import { OrbitControls } from '../../libs/three137/OrbitControls.js';

 class Game{
   constructor(){
     this.initThree();
     this.initWorld();
     this.initScene();
   }

   initThree(){
    const container = document.createElement( 'div' );
		document.body.appendChild( container );
        
    this.debug = true;

    this.clock = new THREE.Clock();

		this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 20 );
		this.camera.position.set( -3, 1.5, 0 );
        
		this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0x000000 );
        
		const ambient = new THREE.HemisphereLight(0x0d0d0d, 0x020202, 0.01);
		this.scene.add(ambient);
        
    const light = new THREE.DirectionalLight();
    light.position.set( 0.2, 1, 1);
    light.castShadow = true;
    this.scene.add(light);
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 512;
    light.shadow.camera.top = 1;
    light.shadow.camera.right = 2;
    light.shadow.camera.bottom = -1;
    light.shadow.camera.left = -2;
    light.shadow.camera.near = 0.2;
    light.shadow.camera.far = 4;
  			
		this.renderer = new THREE.WebGLRenderer({ antialias: true } );
    this.renderer.shadowMap.enabled = true;
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( this.renderer.domElement );
        
    this.controls = new OrbitControls( this.camera, this.renderer.domElement );
    this.controls.enableZoom = true;
    this.controls.enablePan = true;

    this.controls.minDistance = 0.35;
    //this.controls.maxDistance = 1.65;

    // Don't let the camera go below the ground
    this.controls.maxPolarAngle = 0.49 * Math.PI;
    
    this.renderer.setAnimationLoop(this.render.bind(this));

    window.addEventListener('resize', this.resize.bind(this) );
  }

  initWorld() {
    const w = new CANNON.World();
    w.gravity.set(0, -9.82, 0); // m/s²
  
    w.solver.iterations = 10;
    w.solver.tolerance = 0; // Force solver to use all iterations
  
    // Allow sleeping
    w.allowSleep = true;
  
    w.fixedTimeStep = 1.0 / 60.0; // seconds
  
    this.setCollisionBehaviour(w);

    this.helper = new CannonHelper( this.scene, w);
    
    this.world = w;
  }

  setCollisionBehaviour(world) {
    world.defaultContactMaterial.friction = 0.2;
    world.defaultContactMaterial.restitution = 0.8;
  
    const ball_floor = new CANNON.ContactMaterial(
      Ball.MATERIAL,
      Table.FLOOR_MATERIAL,
      {friction: 0.7, restitution: 0.1}
    );

    const ball_wall = new CANNON.ContactMaterial(
      Ball.MATERIAL,
      Table.WALL_MATERIAL,
      {friction: 0.5, restitution: 0.6}
    );

    world.addContactMaterial(ball_floor);
    world.addContactMaterial(ball_wall);
  }
      
  initScene(){
    this.helper = new CannonHelper(this.scene, this.world);
    this.table = new Table(this); 
    this.createBalls();
  }

  createBalls(){
    this.balls = [ new Ball(this, -Table.LENGTH/4, 0) ];

    const rowInc = 1.74 * Ball.RADIUS;
    let row = { x:Table.LENGTH/4+rowInc, count:6, total:6 };
    const ids = [4,3,14,2,15,13,7,12,5,6,8,9,10,11,1];

    for(let i=0; i<15; i++){
        if (row.total==row.count){
            //Initialize a new row
            row.total = 0;
            row.count--;
            row.x -= rowInc;
            row.z = (row.count-1) * (Ball.RADIUS + 0.002);
        }
        this.balls.push( new Ball(this, row.x, row.z, ids[i]));
        row.z -= 2 * (Ball.RADIUS + 0.002);
        row.total++;
    }

    this.cueball = this.balls[0];
  }

  resize(){
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( window.innerWidth, window.innerHeight );  
  }

  render( ) {   
    if (this.cueball){
      this.controls.target.copy( this.cueball.mesh.position );
      this.controls.update();
    }
    this.world.step(this.world.fixedTimeStep);
    this.helper.update();
    this.renderer.render( this.scene, this.camera );
  }
}

export { Game };