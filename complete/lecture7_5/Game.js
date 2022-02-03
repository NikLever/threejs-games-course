import * as THREE from '../../libs/three137/three.module.js';
import * as CANNON from '../../libs/cannon-es.js';
import { RGBELoader } from '../../libs/three137/RGBELoader.js';
import { GLTFLoader } from '../../libs/three137/GLTFLoader.js';
import { OrbitControls } from '../../libs/three137/OrbitControls.js';
import { LoadingBar } from '../../libs/LoadingBar.js';
import { Ball } from './Ball.js';
import { WhiteBall } from './WhiteBall.js';
import { Table } from './Table.js';
import { StrengthBar } from './StrengthBar.js';
import { CannonHelper } from '../../libs/CannonHelper.js';

class Game{
	constructor(){
        this.initThree();
        this.initWorld();
        this.initScene();

        this.strengthBar = new StrengthBar();

        const strengthControl = document.getElementById('strengthControl');

        if ('ontouchstart' in document.documentElement){
            strengthControl.addEventListener( 'touchstart', this.mousedown.bind(this));
            strengthControl.addEventListener( 'touchend', this.mouseup.bind(this));
        }else{
            strengthControl.addEventListener( 'mousedown', this.mousedown.bind(this));
            strengthControl.addEventListener( 'mouseup', this.mouseup.bind(this));
            document.addEventListener( 'keydown', this.keydown.bind(this));
            document.addEventListener( 'keyup', this.keyup.bind(this));
        }

        if (this.helper) this.helper.wireframe = true;
    }

    initThree(){
		const container = document.createElement( 'div' );
		document.body.appendChild( container );
        
        this.debug = false;

        this.loadingBar = new LoadingBar();

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

    keydown( evt ){
        if (evt.keyCode == 32){
            this.strengthBar.visible = true;
        }
    }

    keyup( evt ){
        if (evt.keyCode == 32){
            this.strengthBar.visible = false;
            this.strikeCueball()
        }
    }

    mousedown(evt){
        this.strengthBar.visible = true;
    }

    mouseup( evt ){
        this.strengthBar.visible = false;
        this.strikeCueball()
    }

    strikeCueball(){
        if (this.cueball.isSleeping) this.cueball.hit(this.strengthBar.strength);
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

        if (this.debug) this.helper = new CannonHelper( this.scene, w );

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

    createLight( x, debug=false ){
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

        if (debug){
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
    
    loadGLTF(){
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
                
                this.loadingBar.visible = false;
				
				this.renderer.setAnimationLoop( this.render.bind(this));
			},
			// called while loading is progressing
			xhr => {

				this.loadingBar.progress = (xhr.loaded / xhr.total);
				
			},
			// called when loading has errors
			err => {

				console.error( err );

			}  
        );
    }
    
    initScene(){
        this.setEnvironment();

        this.table = new Table(this);
        
        this.loadGLTF();

        this.createBalls();
    }

    createBalls(){
        this.balls = [ new WhiteBall(this, -Table.LENGTH/4, 0) ];

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

    updateUI( evt ){
        switch(evt.event){
            case 'balldrop':
                break;
            case 'whitedrop':
                break;
        }
    }

    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );  
    }
    
	render( ) {   
        this.controls.target.copy(this.cueball.mesh.position);
        this.controls.update();
        if (this.helper) this.helper.update();
        if (this.strengthBar.visible) this.strengthBar.update();
        const dt = this.clock.getDelta();
        this.world.step(this.world.fixedTimeStep);
        this.balls.forEach( ball => ball.update(dt) );
        this.renderer.render( this.scene, this.camera );
    }
}

export { Game };