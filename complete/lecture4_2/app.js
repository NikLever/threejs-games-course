import * as THREE from '../../libs/three125/three.module.js';
import { GLTFLoader } from '../../libs/three125/GLTFLoader.js';
import { RGBELoader } from '../../libs/three125/RGBELoader.js';
import { OrbitControls } from '../../libs/three125/OrbitControls.js';
import { LoadingBar } from '../../libs/LoadingBar.js';

class App{
	constructor(){
		const container = document.createElement( 'div' );
		document.body.appendChild( container );
        
        this.loadingBar = new LoadingBar();
        this.loadingBar.visible = false;

        this.clock = new THREE.Clock();

		this.assetsPath = '../../assets/';
        
		this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 100 );
        this.camera.position.set( -4.37, 0, -4.75 );
        this.camera.lookAt(0, 0, 6);

        this.cameraController = new THREE.Object3D();
        this.cameraController.add(this.camera);
        this.cameraTarget = new THREE.Vector3(0,0,6);
        
		this.scene = new THREE.Scene();
        this.scene.add(this.cameraController);

		const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
        ambient.position.set( 0.5, 1, 0.25 );
		this.scene.add(ambient);
			
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.outputEncoding = THREE.sRGBEncoding;
		container.appendChild( this.renderer.domElement );
        this.setEnvironment();
        
        
        this.load();
		
		window.addEventListener('resize', this.resize.bind(this) );

        document.addEventListener('keydown', this.keyDown.bind(this));
        document.addEventListener('keyup', this.keyUp.bind(this));
        
        this.keys = { space:false, left:false, right: false };
	}
	
    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
    	this.camera.updateProjectionMatrix();
    	this.renderer.setSize( window.innerWidth, window.innerHeight ); 
    }
    
    keyDown(evt){
        switch(evt.keyCode){
            case 32:
                this.keys.space = true;
                break;
        }
    }
    
    keyUp(evt){
        switch(evt.keyCode){
            case 32:
                this.keys.space = false;
                break;
        }
    }

    setEnvironment(){
        const loader = new RGBELoader().setDataType( THREE.UnsignedByteType ).setPath(this.assetsPath);
        const pmremGenerator = new THREE.PMREMGenerator( this.renderer );
        pmremGenerator.compileEquirectangularShader();
        
        const self = this;
        
        loader.load( 'hdr/venice_sunset_1k.hdr', ( texture ) => {
          const envMap = pmremGenerator.fromEquirectangular( texture ).texture;
          pmremGenerator.dispose();

          self.scene.environment = envMap;

        }, undefined, (err)=>{
            console.error( err.message );
        } );
    }
    
	load(){
        this.loadPlane();
        this.loadSkybox();
    }

    loadSkybox(){
        this.scene.background = new THREE.CubeTextureLoader()
	        .setPath( `${this.assetsPath}skybox/paintedsky/` )
            .load( [
                'px.jpg',
                'nx.jpg',
                'py.jpg',
                'ny.jpg',
                'pz.jpg',
                'nz.jpg'
            ] );
    }

    loadPlane(){
    	const loader = new GLTFLoader( ).setPath(this.assetsPath);
        const self = this;
        
        this.loadingBar.visible = true;
		
		// Load a glTF resource
		loader.load(
			// resource URL
			'microplane.glb',
			// called when the resource is loaded
			gltf => {

				self.scene.add( gltf.scene );
                self.plane = gltf.scene;
                self.plane.userData.velocity = new THREE.Vector3(0,0,0.1);

                self.propeller = self.plane.getObjectByName("propeller");
        
                self.loadingBar.visible = false;
                
                self.renderer.setAnimationLoop( self.render.bind(self) );
			},
			// called while loading is progressing
			xhr => {

				self.loadingBar.progress = (xhr.loaded / xhr.total);
				
			},
			// called when loading has errors
			err => {

				console.error( err.message );

			}
		);
	}			
    
    updatePlane(time){
        if (!this.keys.space){
            this.plane.userData.velocity.y -= 0.001;
        }else{
            this.plane.userData.velocity.y += 0.001;
        }
        this.plane.translateZ( this.plane.userData.velocity.z );
        this.plane.translateY( this.plane.userData.velocity.y );
        this.plane.rotation.z = Math.sin(time*3)*0.2;
    }

    updateCamera(){
        this.cameraController.position.copy( this.plane.position );
        this.cameraController.position.y = 0;
        this.cameraTarget.copy(this.plane.position);
        this.cameraTarget.z += 6;
        this.camera.lookAt( this.cameraTarget );
    }

	render() {
        if (this.propeller !== undefined) this.propeller.rotateZ(1);

        const time = this.clock.getElapsedTime();

        this.updatePlane(time);
        this.updateCamera();

        this.renderer.render( this.scene, this.camera );

    }
}

export { App };