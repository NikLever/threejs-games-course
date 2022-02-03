import {NPC} from './NPC.js';
import {GLTFLoader} from '../../libs/three137/GLTFLoader.js';
import {DRACOLoader} from '../../libs/three137/DRACOLoader.js';
import {Skeleton, Raycaster} from '../../libs/three137/three.module.js';

class NPCHandler{
    constructor( game ){
        this.game = game;
		this.loadingBar = this.game.loadingBar;
        this.load();
		this.initMouseHandler();
	}

	initMouseHandler(){
		const raycaster = new Raycaster();
    	this.game.renderer.domElement.addEventListener( 'click', raycast, false );
			
    	const self = this;
    	const mouse = { x:0, y:0 };
    	
    	function raycast(e){
    		
			mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
			mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;

			//2. set the picking ray from the camera position and mouse coordinates
			raycaster.setFromCamera( mouse, self.game.camera );    

			//3. compute intersections
			const intersects = raycaster.intersectObject( self.game.navmesh );
			
			if (intersects.length>0){
				const pt = intersects[0].point;
				console.log(pt);
				self.npcs[0].newPath(pt, true);
			}	
		}
    }

    load(){
        const loader = new GLTFLoader( ).setPath(`${this.game.assetsPath}factory/`);
		const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath( '../../libs/three137/draco/' );
        loader.setDRACOLoader( dracoLoader );
        this.loadingBar.visible = true;
		
		// Load a GLTF resource
		loader.load(
			// resource URL
			`swat-guy.glb`,
			// called when the resource is loaded
			gltf => {
				if (this.game.pathfinder){
					this.initNPCs(gltf);
				}else{
					this.gltf = gltf;
				}
			},
			// called while loading is progressing
			xhr => {

				this.loadingBar.update( 'swat-guy', xhr.loaded, xhr.total );

			},
			// called when loading has errors
			err => {

				console.error( err );

			}
		);
	}
    
	initNPCs(gltf = this.gltf){
		const gltfs = [gltf];
				
		this.npcs = [];
		
		gltfs.forEach(gltf => {
			const object = gltf.scene;

			object.traverse(function(child){
				if (child.isMesh){
					child.castShadow = true;
				}
			});

			const options = {
				object: object,
				speed: 0.8,
				animations: gltf.animations,
				app: this.game,
				showPath: true,
				zone: 'factory',
				name: 'swat-guy',
			};

			const npc = new NPC(options);

			npc.object.position.set(-7.607, 0.017, -7.713);
			npc.action = 'idle';
			
			this.npcs.push(npc);
			
		});

		this.loadingBar.visible = !this.loadingBar.loaded;

		this.game.startRendering();
	}

    update(dt){
        if (this.npcs) this.npcs.forEach( npc => npc.update(dt) );
    }
}

export { NPCHandler };