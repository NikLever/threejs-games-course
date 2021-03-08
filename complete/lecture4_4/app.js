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

        document.addEventListener('touchstart', this.mouseDown.bind(this) );
        document.addEventListener('touchend', this.mouseUp.bind(this) );
        document.addEventListener('mousedown', this.mouseDown.bind(this) );
        document.addEventListener('mouseup', this.mouseUp.bind(this) );
        
        this.spaceKey = false;
        this.gameActive = false;

        const btn = document.getElementById('playBtn');
        btn.addEventListener('click', this.startGame.bind(this));
	}
	
    startGame(){
        const instructions = document.getElementById('instructions');
        const btn = document.getElementById('playBtn');

        instructions.style.display = 'none';
        btn.style.display = 'none';

        this.gameActive = true;
    }

    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
    	this.camera.updateProjectionMatrix();
    	this.renderer.setSize( window.innerWidth, window.innerHeight ); 
    }

    keyDown(evt){
        switch(evt.keyCode){
            case 32:
                this.spaceKey = true; 
                break;
        }
    }
    
    keyUp(evt){
        switch(evt.keyCode){
            case 32:
                this.spaceKey = false;
                break;
        }
    }

    mouseDown(evt){
        this.spaceKey = true;
    }

    mouseUp(evt){
        this.spaceKey = false;
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
        this.loadStar();
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

    loadStar(){
    	const loader = new GLTFLoader( ).setPath(this.assetsPath);
        const self = this;
        
        this.loadingBar.visible = true;
        
		// Load a glTF resource
		loader.load(
			// resource URL
			'star.glb',
			// called when the resource is loaded
			gltf => {

                self.star = gltf.scene.children[0];
                self.loadBomb();

			},
			// called while loading is progressing
			xhr => {

				self.loadingBar.progress = (xhr.loaded / xhr.total) * 0.33;
				
			},
			// called when loading has errors
			err => {

				console.error( err.message );

			}
		);
	}	

    loadBomb(){
    	const loader = new GLTFLoader( ).setPath(this.assetsPath);
        const self = this;
        
		// Load a glTF resource
		loader.load(
			// resource URL
			'bomb.glb',
			// called when the resource is loaded
			gltf => {

                self.bomb = gltf.scene.children[0];

                self.initObstacles();

                self.loadPlane();

			},
			// called while loading is progressing
			xhr => {

				self.loadingBar.progress = (xhr.loaded / xhr.total) * 0.33 + 0.33;
				
			},
			// called when loading has errors
			err => {

				console.error( err.message );

			}
		);
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
                self.plane.userData.heading = 0;

                self.propeller = self.plane.getObjectByName("propeller");
        
                self.loadingBar.visible = false;
                
                self.renderer.setAnimationLoop( self.render.bind(self) );
			},
			// called while loading is progressing
			xhr => {

				self.loadingBar.progress = (xhr.loaded / xhr.total) * 0.33 + 0.66;
				
			},
			// called when loading has errors
			err => {

				console.error( err.message );

			}
		);
	}			
    
    initObstacles(){
        this.obstacles = [];
        
        const obstacle = new THREE.Group();
        
        obstacle.add(this.star);
        
        this.bomb.rotation.x = -Math.PI*0.5;
        this.bomb.position.y = 7.5;
        obstacle.add(this.bomb);

        let rotate=true;

        for(let y=5; y>-7; y-=2.5){
            rotate = !rotate;
            if (y==0) continue;
            const bomb = this.bomb.clone();
            bomb.rotation.x = (rotate) ? -Math.PI*0.5 : 0;
            bomb.position.y = y;
            obstacle.add(bomb);
        
        }
        this.obstacles.push(obstacle);

        this.scene.add(obstacle);

        const self = this;

        this.obstacleSpawn = { pos: 20, offset: 10, setPos: obstacle =>{
            self.obstacleSpawn.pos += 30;
            const offset = (Math.random()*2 - 1) * self.obstacleSpawn.offset;
            self.obstacleSpawn.offset += 0.1;
            obstacle.position.set(0, offset, self.obstacleSpawn.pos );
            obstacle.children[0].rotation.y = Math.random() * Math.PI * 2;
        } };
        self.obstacleSpawn.setPos( obstacle );

        while (this.obstacleSpawn.pos < 100){
            
            const obstacle1 = obstacle.clone();
            
            self.scene.add(obstacle1);
            self.obstacles.push(obstacle1);

            self.obstacleSpawn.setPos( obstacle1 );
        }
    }

    updatePlane(time){
        const MAXHEADING = 0.5;

        if (this.gameActive){
            if (!this.spaceKey){
                this.plane.userData.velocity.y -= 0.001;
            }else{
                this.plane.userData.velocity.y += 0.001;
            }
            this.plane.rotation.set(0, 0, Math.sin(time*3)*0.2, 'XYZ');
            this.plane.translateZ( this.plane.userData.velocity.z );
            this.plane.translateY( this.plane.userData.velocity.y );
        }else{
            this.plane.rotation.set(0, 0, Math.sin(time*3)*0.2, 'XYZ');
            this.plane.position.y = Math.cos(time) * 1.5;
        }

    }

    updateCamera(){
        this.cameraController.position.copy( this.plane.position );
        this.cameraController.position.y = 0;
        this.cameraTarget.copy(this.plane.position);
        this.cameraTarget.z += 6;
        this.camera.lookAt( this.cameraTarget );
    }

    updateObstacles(){
        this.obstacles.forEach( obstacle =>{
            obstacle.children[0].rotateY(0.01);
            if ((obstacle.position.z-this.plane.position.z)<-20){
                this.obstacleSpawn.setPos(obstacle); 
            }
        });
    }

	render() {
        if (this.propeller !== undefined) this.propeller.rotateZ(1);

        const time = this.clock.getElapsedTime();

        this.updateObstacles();
        this.updatePlane(time);
        this.updateCamera();

        this.renderer.render( this.scene, this.camera );

    }
}

export { App };