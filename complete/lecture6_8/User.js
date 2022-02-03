import { Group, 
         Object3D,
         Vector3,
		 LoopOnce,
         Quaternion,
         Raycaster,
         AnimationMixer, 
         SphereGeometry, 
         MeshBasicMaterial, 
         Mesh } from '../../libs/three137/three.module.js';
import { GLTFLoader } from '../../libs/three137/GLTFLoader.js';
import { DRACOLoader } from '../../libs/three137/DRACOLoader.js';

class User{
    constructor(game, pos, heading){
        this.root = new Group();
        this.root.position.copy( pos );
        this.root.rotation.set( 0, heading, 0, 'XYZ' );

        this.game = game;

        this.camera = game.camera;
        this.raycaster = new Raycaster();

        game.scene.add(this.root);

        this.loadingBar = game.loadingBar;

        this.load();

        this.initMouseHandler();
		this.initRifleDirection();
    }

	initRifleDirection(){
		this.rifleDirection = {};

		this.rifleDirection.idle = new Quaternion(-0.178, -0.694, 0.667, 0.203);
		this.rifleDirection.walk = new Quaternion( 0.044, -0.772, 0.626, -0.102);
		this.rifleDirection.firingwalk = new Quaternion(-0.025, -0.816, 0.559, -0.147);
		this.rifleDirection.firing = new Quaternion( 0.037, -0.780, 0.6, -0.175);
		this.rifleDirection.run = new Quaternion( 0.015, -0.793, 0.595, -0.131);
		this.rifleDirection.shot = new Quaternion(-0.082, -0.789, 0.594, -0.138);
	}

    initMouseHandler(){
		this.game.renderer.domElement.addEventListener( 'click', raycast, false );
			
    	const self = this;
    	const mouse = { x:0, y:0 };
    	
    	function raycast(e){
    		
			mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
			mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;

			//2. set the picking ray from the camera position and mouse coordinates
			self.raycaster.setFromCamera( mouse, self.game.camera );    

			//3. compute intersections
			const intersects = self.raycaster.intersectObject( self.game.navmesh );
			
			if (intersects.length>0){
				const pt = intersects[0].point;
				console.log(pt);

				self.root.position.copy(pt);
			}	
		}
    }

    set position(pos){
        this.root.position.copy( pos );
    }

    addSphere(){
        const geometry = new SphereGeometry( 0.1, 8, 8 );
        const material = new MeshBasicMaterial( { color: 0xFF0000 });
        const mesh = new Mesh( geometry, material );
        this.root.add(mesh);
    }

    load(){
    	const loader = new GLTFLoader( ).setPath(`${this.game.assetsPath}factory/`);
		const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath( '../../libs/three137/draco/' );
        loader.setDRACOLoader( dracoLoader );
        
        // Load a glTF resource
		loader.load(
			// resource URL
			'eve2.glb',
			// called when the resource is loaded
			gltf => {
				this.root.add( gltf.scene );
                this.object = gltf.scene;

                const scale = 1.2;
                this.object.scale.set(scale, scale, scale);

                this.object.traverse( child => {
                    if ( child.isMesh){
                        child.castShadow = true;
						if (child.name.includes('Rifle')) this.rifle = child;
                    }
                });

                this.animations = {};

                gltf.animations.forEach( animation => {
                    this.animations[animation.name.toLowerCase()] = animation;
                })

                this.mixer = new AnimationMixer(gltf.scene);
            
                this.action = 'idle';
    		},
			// called while loading is progressing
			xhr => {
				this.loadingBar.update( 'user', xhr.loaded, xhr.total );
			},
			// called when loading has errors
			err => {
				console.error( err );
			}
		);
	}

    set action(name){
		if (this.actionName == name.toLowerCase()) return;
				
		const clip = this.animations[name.toLowerCase()];

		if (clip!==undefined){
			const action = this.mixer.clipAction( clip );
			if (name=='shot'){
				action.clampWhenFinished = true;
				action.setLoop( LoopOnce );
			}
			action.reset();
			const nofade = this.actionName == 'shot';
			this.actionName = name.toLowerCase();
			action.play();
			if (this.curAction){
				if (nofade){
					this.curAction.enabled = false;
				}else{
					this.curAction.crossFadeTo(action, 0.5);
				}
			}
			this.curAction = action;
			if (this.rifle && this.rifleDirection){
				const q = this.rifleDirection[name.toLowerCase()];
				if (q!==undefined){
					this.rifle.quaternion.copy(q);
					this.rifle.rotateX(1.57);
				}
			}
		}
	}
	
	update(dt){
		if (this.mixer) this.mixer.update(dt);
    }
}

export { User };