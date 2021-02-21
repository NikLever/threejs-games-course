import * as THREE from '../../libs/three125/three.module.js';
import { GLTFLoader } from '../../libs/three125/GLTFLoader.js';
import { RGBELoader } from '../../libs/three125/RGBELoader.js';
import { LoadingBar } from '../../libs/LoadingBar.js';

class App{
	constructor(){
		const container = document.createElement( 'div' );
		document.body.appendChild( container );
        
        this.loadingBar = new LoadingBar();
        this.loadingBar.visible = false;

		this.assetsPath = '../../assets/';
        
		this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 20 );
		this.camera.position.set( 0, 0, 5 );
        
		this.scene = new THREE.Scene();

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
    
	render() {

        this.renderer.render( this.scene, this.camera );

    }
}

export { App };