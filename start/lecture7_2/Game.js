import * as THREE from '../../libs/three137/three.module.js';
import * as CANNON from '../../libs/cannon-es.js';
import { CannonHelper } from '../../libs/CannonHelper.js';
import { OrbitControls } from '../../libs/three137/OrbitControls.js';
import { Ball } from './Ball.js';
import { Table } from './Table.js';

 class Game{
   constructor(){
     this.initThree();
     this.initWorld();
     this.initScene();
   }

   initThree(){
    const container = document.createElement( 'div' );
    document.body.appendChild( container );
    
    this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 20 );
		this.camera.position.set( -3, 1.5, 0 );
    
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xaaaaaa );

    const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 0.3);
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
    //const lightHelper = new THREE.CameraHelper( light.shadow.camera );
    //this.scene.add( lightHelper );
  
    this.renderer = new THREE.WebGLRenderer({ antialias: true } );
    this.renderer.shadowMap.enabled = true;
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( this.renderer.domElement );
    
    this.controls = new OrbitControls( this.camera, this.renderer.domElement );
    
    this.renderer.setAnimationLoop(this.render.bind(this));

    window.addEventListener('resize', this.resize.bind(this) );
  }

   initWorld() {
    const w = new CANNON.World();
    w.gravity.set(0, -9.82, 0); // m/s²
  
    // Allow sleeping
    w.allowSleep = true;
  
    w.fixedTimeStep = 1.0 / 60.0; // seconds
  
    this.setCollisionBehaviour(w);

    this.helper = new CannonHelper( this.scene, w);
    
    this.world = w;
  }

  setCollisionBehaviour(world) {
    
  }
      // Spheres
  initScene(){
    //Create a simple table
    this.table = new Table(this);
    this.createBalls();
  }

  createBalls(){
    
  }

  resize(){
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( window.innerWidth, window.innerHeight );  
  }

  render( ) {  
    this.world.step(this.world.fixedTimeStep);
    this.helper.update();
    this.renderer.render( this.scene, this.camera );
  }
}

export { Game };