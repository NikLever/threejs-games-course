import { Group, 
         Object3D,
         Vector3,
         Quaternion,
         Raycaster,
         AnimationMixer, 
         SphereGeometry, 
         MeshBasicMaterial, 
         Mesh } from '../../libs/three128/three.module.js';
import { GLTFLoader } from '../../libs/three128/GLTFLoader.js';
import { DRACOLoader } from '../../libs/three128/DRACOLoader.js';

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

        this.tmpVec = new Vector3();
        this.tmpQuat = new Quaternion();

        this.initMouseHandler();
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

                self.root.remove( self.dolly )

                self.dolly.position.copy( self.game.camera.position );
                self.dolly.quaternion.copy( self.game.camera.quaternion );

                self.root.attach(self.dolly);
			}	
		}
    }

    set position(pos){
        this.root.position.copy( pos );
    }

	get position(){
		return this.root.position;
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
        dracoLoader.setDecoderPath( '../../libs/three128/draco/' );
        loader.setDRACOLoader( dracoLoader );
        
        // Load a glTF resource
		loader.load(
			// resource URL
			'eve.glb',
			// called when the resource is loaded
			gltf => {
				this.root.add( gltf.scene );
                this.object = gltf.scene;
				this.object.frustumCulled = false;

                const scale = 1.2;
                this.object.scale.set(scale, scale, scale);

                this.object.traverse( child => {
                    if ( child.isMesh){
                        child.castShadow = true;
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
		
		//console.log(`User action:${name}`);
		
		const clip = this.animations[name.toLowerCase()];

		if (clip!==undefined){
			const action = this.mixer.clipAction( clip );
			if (name=='shot'){
				action.clampWhenFinished = true;
				action.setLoop( THREE.LoopOnce );
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
		}
	}
	
	update(dt){
		if (this.mixer) this.mixer.update(dt);
    }
}

export { User };