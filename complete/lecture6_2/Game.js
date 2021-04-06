import * as THREE from '../../libs/three126/three.module.js';
import { GLTFLoader } from '../../libs/three126/GLTFLoader.js';
import { RGBELoader } from '../../libs/three126/RGBELoader.js';
import { WaypointHelper} from './WaypointHelper.js';
import { LoadingBar } from '../../libs/LoadingBar.js';

class Game{
	constructor(){
		const container = document.createElement( 'div' );
		document.body.appendChild( container );
        
		this.clock = new THREE.Clock();

        this.loadingBar = new LoadingBar();
        this.loadingBar.visible = false;

		this.assetsPath = '../../assets/';
        
		this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 500 );
		this.camera.position.set( 0, 100, 0 );
		this.camera.lookAt(0,0,0);
        		
		let col = 0x201510;
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color( col );
		this.scene.fog = new THREE.Fog( col, 100, 200 );

		const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
		this.scene.add(ambient);

        const light = new THREE.DirectionalLight();
        light.position.set( 4, 20, 20 );
		light.castShadow = true;
		//Set up shadow properties for the light
		light.shadow.mapSize.width = 1024; 
		light.shadow.mapSize.height = 1024; 
		light.shadow.camera.near = 0.5; 
		light.shadow.camera.far = 50;
		const d = 10; 
		light.shadow.camera.left = light.shadow.camera.bottom = -d;
		light.shadow.camera.right = light.shadow.camera.top = d;
		this.scene.add(light);
		this.light = light;

		const helper = new THREE.CameraHelper( light.shadow.camera );
		this.scene.add( helper );
			
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true } );
		this.renderer.shadowMap.enabled = true;
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.outputEncoding = THREE.sRGBEncoding;
		container.appendChild( this.renderer.domElement );
        this.setEnvironment();
  
        this.load();
		
		window.addEventListener('resize', this.resize.bind(this) );
        
	}
	
    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
    	this.camera.updateProjectionMatrix();
    	this.renderer.setSize( window.innerWidth, window.innerHeight ); 
    }
    
    setEnvironment(){
        const loader = new RGBELoader().setDataType( THREE.UnsignedByteType ).setPath(this.assetsPath);
        const pmremGenerator = new THREE.PMREMGenerator( this.renderer );
        pmremGenerator.compileEquirectangularShader();
        
        loader.load( 'hdr/factory.hdr', ( texture ) => {
          const envMap = pmremGenerator.fromEquirectangular( texture ).texture;
          pmremGenerator.dispose();

          this.scene.environment = envMap;

        }, undefined, (err)=>{
            console.error( err.message );
        } );
    }
    
	load(){
        this.loadEnvironment();
    }

    loadEnvironment(){
    	const loader = new GLTFLoader( ).setPath(`${this.assetsPath}factory/`);
        
        this.loadingBar.visible = true;
		
		// Load a glTF resource
		loader.load(
			// resource URL
			'factory.glb',
			// called when the resource is loaded
			gltf => {

				this.scene.add( gltf.scene );
                this.factory = gltf.scene;
				this.fans = [];

				gltf.scene.traverse( child => {
					if (child.isMesh){
						if (child.name == 'NavMesh'){
							this.navmesh = child;
							child.material.transparent = true;
							child.material.opacity = 0.5;
						}else if (child.name.includes('fan')){
							this.fans.push( child );
						}else if (child.parent.name.includes('main')){
							child.castShadow = true;
							child.receiveShadow = true;
						}
					}
				});
	
				this.scene.add(this.navmesh);
				this.navmesh.geometry.rotateX( Math.PI/2 );
				this.navmesh.quaternion.identity();
				this.navmesh.position.set(0,0,0);

				this.waypointHelper = new WaypointHelper(this.navmesh, this.camera);

                this.loadingBar.visible = false;
                
                this.renderer.setAnimationLoop( this.render.bind(this) );
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
    
	render() {
		const dt = this.clock.getDelta();

		if (this.fans !== undefined){
            this.fans.forEach(fan => {
                fan.rotateY(dt); 
            });
        }

		if (this.controller !== undefined) this.controller.update(dt);

        this.renderer.render( this.scene, this.camera );

    }
}

export { Game };