import * as THREE from '../../libs/three137/three.module.js';
import * as CANNON from '../../libs/cannon-es.js';
import { CannonHelper } from '../../libs/CannonHelper.js';
import { RGBELoader } from '../../libs/three137/RGBELoader.js';
import { GLTFLoader } from '../../libs/three137/GLTFLoader.js';
import { OrbitControls } from '../../libs/three137/OrbitControls.js';
import { LoadingBar } from '../../libs/LoadingBar.js';
import { Ball } from './Ball.js';
import { Table } from './Table.js';

class Game{
	constructor(){
        this.debug = false;
        this.initThree();
        this.initWorld();
        this.initScene();
    }

    initThree(){
		const container = document.createElement( 'div' );
		document.body.appendChild( container );
        
        this.clock = new THREE.Clock();

		this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 20 );
		this.camera.position.set( -3, 1.5, 0 );
        
		this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0x000000 );
        
		const ambient = new THREE.HemisphereLight(0x0d0d0d, 0x020202, 0.01);
		this.scene.add(ambient);
        
        this.createLight( Table.LENGTH / 4 );
        this.createLight( -Table.LENGTH / 4 );
  			
		this.renderer = new THREE.WebGLRenderer({ antialias: true } );
        this.renderer.shadowMap.enabled = true;
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.physicallyCorrectLights = true;
        container.appendChild( this.renderer.domElement );
        
        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        
        window.addEventListener('resize', this.resize.bind(this) );
	}	
    
    createLight( x ){
        //SpotLight( color : Integer, intensity : Float, distance : Float, angle : Radians, penumbra : Float, decay : Float )
        const spotlight = new THREE.SpotLight(0xffffe5, 2.5, 10, 0.8, 0.5, 2);
          
        spotlight.position.set(x, 1.5, 0);
        spotlight.target.position.set(x, 0, 0); //the light points directly towards the xz plane
        spotlight.target.updateMatrixWorld();
          
        spotlight.castShadow = true;
        spotlight.shadow.camera.fov = 70;
        spotlight.shadow.camera.near = 1;
        spotlight.shadow.camera.far = 2.5;
        spotlight.shadow.mapSize.width = 2048;
        spotlight.shadow.mapSize.height = 2048;
          
        this.scene.add(spotlight);

        if (this.debug){
            const spotLightHelper = new THREE.SpotLightHelper( spotlight );
            this.scene.add( spotLightHelper );
        }
    }

    setEnvironment(){
        const loader = new RGBELoader();
        const pmremGenerator = new THREE.PMREMGenerator( this.renderer );
        pmremGenerator.compileEquirectangularShader();
        
        loader.load( '../../assets/hdr/living_room.hdr',  
            texture => {
                const envMap = pmremGenerator.fromEquirectangular( texture ).texture;
                pmremGenerator.dispose();
                this.scene.environment = envMap;
            }, 
            undefined, 
            err => console.error( err )
         );
    }
    
    initWorld(){
        const w = new CANNON.World();
        w.gravity.set(0, -9.82, 0); // m/s²
      
        w.solver.iterations = 10;
        w.solver.tolerance = 0; // Force solver to use all iterations
      
        // Allow sleeping
        w.allowSleep = true;
      
        w.fixedTimeStep = 1.0 / 60.0; // seconds
      
        this.setCollisionBehaviour(w);
    
        if (this.debug) this.helper = new CannonHelper( this.scene, w);
        
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
        this.table = new Table(this);

        this.setEnvironment();

        this.loadGLTF();

        this.createBalls();

        if (this.helper) this.helper.wireframe = true;
    }

    loadGLTF(){
        const loadingBar = new LoadingBar();  
        
        const loader = new GLTFLoader( ).setPath('../../assets/pool-table/');
        
		// Load a glTF resource
		loader.load(
			// resource URL
			'pool-table.glb',
			// called when the resource is loaded
			gltf => {
                
                this.table = gltf.scene;
                this.table.position.set( -Table.LENGTH/2, 0, Table.WIDTH/2)
                this.table.traverse( child => {
                    if (child.name == 'Cue'){
                        this.cue = child;
                        child.visible = false;
                    }
                    if (child.name == 'Felt'){
                        this.edges = child;
                    }
                    if (child.isMesh){
                        child.material.metalness = 0.0;
                        child.material.roughness = 0.3;
                    }
                    if (child.parent !== null && child.parent.name !== null && child.parent.name == 'Felt'){
                        child.material.roughness = 0.8;
                        child.receiveShadow = true;
                    }
                })
				this.scene.add( gltf.scene );
                
                loadingBar.visible = false;
				
				this.renderer.setAnimationLoop( this.render.bind(this));
			},
			// called while loading is progressing
			xhr => {

				loadingBar.progress = (xhr.loaded / xhr.total);
				
			},
			// called when loading has errors
			err => {

				console.error( err );

			}  
        );
    }

    createBalls(){
        const X_offset = Table.LENGTH / 4;
        const X_offset_2 = 1.72;

        this.balls = [ new Ball(this, -Table.LENGTH/4, 0) ];

        const rowInc = 1.72 * Ball.RADIUS;
        let row = { x:Table.LENGTH/4+rowInc, count:6, total:6 };
        const ids = [4,3,14,2,15,13,7,12,5,6,8,9,10,11,1];

        for(let i=0; i<15; i++){
            if (row.total==row.count){
                //Initialize a new row
                row.total = 0;
                row.count--;
                row.x -= rowInc;
                row.z = (row.count-1) * Ball.RADIUS;
            }
            this.balls.push( new Ball(this, row.x, row.z, ids[i]));
            row.z -= 2 * Ball.RADIUS;
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
        this.world.step(this.world.fixedTimeStep)
        this.controls.target.copy(this.balls[0].mesh.position);
        this.controls.update();
        if (this.helper) this.helper.update();
        this.balls.forEach( ball => ball.update() );
        this.renderer.render( this.scene, this.camera );
    }
}

export { Game };