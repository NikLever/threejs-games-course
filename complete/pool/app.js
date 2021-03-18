import * as THREE from '../../libs/three126/three.module.js';
import { RGBELoader } from '../../libs/three126/RGBELoader.js';
import { GLTFExporter } from '../../libs/three126/GLTFExporter.js';
import { OrbitControls } from '../../libs/three126/OrbitControls.js';
import { LoadingBar } from '../../libs/LoadingBar.js';

class App{
	constructor(){
		const container = document.createElement( 'div' );
		document.body.appendChild( container );
        
		this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 100 );
		this.camera.position.set( 0, 0, 5 );
        
		this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0xaaaaaa );
        
		const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 0.5);
		this.scene.add(ambient);
        
        const light = new THREE.DirectionalLight( 0xFFFFFF, 1.5 );
        light.position.set( 0.2, 1, 1);
        this.scene.add(light);
			
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.physicallyCorrectLights = true;
        container.appendChild( this.renderer.domElement );
		this.setEnvironment();
		
        THREE.DefaultLoadingManager.onProgress = (item, loaded, total) => {
            if (this.loadingBar === 'undefined') return;

            this.loadingBar.loaded = (loaded / total);
          
            if (loaded == total && total > 7) {
              // hide progress bar
              this.loadingBar.visible = false;

              this.renderer.setAnimationLoop( this.render.bind(this) );
            }
          };

        this.loadingBar = new LoadingBar();
        
        this.loadJSON();
        
        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        
        window.addEventListener('resize', this.resize.bind(this) );
	}	
    
    setEnvironment(){
        const loader = new RGBELoader().setDataType( THREE.UnsignedByteType );
        const pmremGenerator = new THREE.PMREMGenerator( this.renderer );
        pmremGenerator.compileEquirectangularShader();
        
        const self = this;
        
        loader.load( '../../assets/hdr/venice_sunset_1k.hdr', ( texture ) => {
          const envMap = pmremGenerator.fromEquirectangular( texture ).texture;
          pmremGenerator.dispose();

          self.scene.environment = envMap;

        }, undefined, (err)=>{
            console.error( 'An error occurred setting the environment');
        } );
    }
    
    loadJSON(){
        let loader = new THREE.ObjectLoader();
  
        loader.load('json/table/base.json', function (geometry) {
            var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
            color: new THREE.Color(0x000000),
            specular: 0x404040,
            shininess: 20,
            shading: THREE.SmoothShading
            }));

            mesh.position.x = mesh_x;
            mesh.position.y = mesh_y;
            mesh.position.z = mesh_z;
            mesh.scale.set(100, 100, 100);
            mesh.receiveShadow = true;
            mesh.castShadow = true;
            scene.add(mesh);
        });

        loader.load('json/table/felt.json', function (geometry) {
            var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
            color: new THREE.Color(TABLE_COLORS.cloth),
            specular: 0x404040,
            shininess: 10,
            shading: THREE.SmoothShading
            }));

            mesh.position.x = mesh_x;
            mesh.position.y = mesh_y;
            mesh.position.z = mesh_z;
            mesh.scale.set(100, 100, 100);
            mesh.receiveShadow = true;
            mesh.castShadow = true;
            scene.add(mesh);
        });

        loader.load('json/table/edges.json', function (geometry) {
            var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
            color: new THREE.Color(0x7a5230),
            specular: 0x404040,
            shininess: 100,
            shading: THREE.SmoothShading
            }));

            mesh.position.x = mesh_x;
            mesh.position.y = mesh_y;
            mesh.position.z = mesh_z;
            mesh.scale.set(100, 100, 100);
            mesh.receiveShadow = true;
            mesh.castShadow = true;
            scene.add(mesh);
        });

        loader.load('json/table/pockets.json', function (geometry) {
            var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
            color: new THREE.Color(0x7a5230),
            specular: 0x3D3D3D,
            shininess: 20,
            shading: THREE.SmoothShading
            }));

            mesh.position.x = mesh_x;
            mesh.position.y = mesh_y;
            mesh.position.z = mesh_z;
            mesh.scale.set(100, 100, 100);
            mesh.receiveShadow = true;
            mesh.castShadow = true;
            scene.add(mesh);
        });

        loader.load('json/table/pocket_bottoms.json', function (geometry) {
            var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
            color: new THREE.Color(0x000),
            specular: 0x000,
            shininess: 0,
            shading: THREE.SmoothShading
            }));

            mesh.position.x = mesh_x;
            mesh.position.y = mesh_y;
            mesh.position.z = mesh_z;
            mesh.scale.set(100, 100, 100);
            mesh.receiveShadow = true;
            mesh.castShadow = true;
            scene.add(mesh);
        });
    }
    
    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );  
    }
    
	render( ) {   
        this.plane.rotateY( 0.01 );
        this.renderer.render( this.scene, this.camera );
    }
}

export { App };