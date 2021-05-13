import {NPC} from './NPC.js';
import {GLTFLoader} from '../../libs/three126/GLTFLoader.js';
import {Skeleton, Raycaster} from '../../libs/three126/three.module.js';

class NPCHandler{
    constructor( game ){
        this.game = game;
		this.loadingBar = this.game.loadingBar;
        this.waypoints = game.waypoints;
        this.load();

		const raycaster = new Raycaster();
    	game.renderer.domElement.addEventListener( 'click', raycast, false );
			
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
        
		const loader = new GLTFLoader().setPath(`${this.game.assetsPath}factory/`);
		
		// Load a GLTF resource
		loader.load(
			// resource URL
			`swat-guy.glb`,
			// called when the resource is loaded
			gltf => {
				const gltfs = [gltf];
				
                for(let i=0; i<3; i++) gltfs.push(this.cloneGLTF(gltf));
				
				this.npcs = [];
				
				gltfs.forEach(gltf => {
					const object = gltf.scene;

					object.frustumCulled = false;

					object.traverse(function(child){
						if (child.isMesh){
							child.castShadow = true;
							child.frustumCulled = false;
						}
					});

					const options = {
						object: object,
						speed: 1.2,
						animations: gltf.animations,
						app: this.game,
						waypoints: this.waypoints,
						showPath: false,
						zone: 'factory',
						name: 'swat-guy',
					};

					const npc = new NPC(options);

					npc.object.position.copy(this.randomWaypoint);
					npc.newPath(this.randomWaypoint);
					
					this.npcs.push(npc);
					
				});

				this.loadingBar.visible = false;

				this.game.startRendering();
			},
			// called while loading is progressing
			xhr => {

				this.loadingBar.update('swat-guy', xhr.loaded, xhr.total);

			},
			// called when loading has errors
			err => {

				console.error( err );

			}
		);
	}
    
    cloneGLTF(gltf){
	
		const clone = {
			animations: gltf.animations,
			scene: gltf.scene.clone(true)
		  };
		
		const skinnedMeshes = {};
		
		gltf.scene.traverse(node => {
			if (node.isSkinnedMesh) {
			  skinnedMeshes[node.name] = node;
			}
		});
		
		const cloneBones = {};
		const cloneSkinnedMeshes = {};
		
		clone.scene.traverse(node => {
			if (node.isBone) {
			  cloneBones[node.name] = node;
			}
			if (node.isSkinnedMesh) {
			  cloneSkinnedMeshes[node.name] = node;
			}
		});
		
		for (let name in skinnedMeshes) {
			const skinnedMesh = skinnedMeshes[name];
			const skeleton = skinnedMesh.skeleton;
			const cloneSkinnedMesh = cloneSkinnedMeshes[name];
			const orderedCloneBones = [];
			for (let i = 0; i < skeleton.bones.length; ++i) {
				const cloneBone = cloneBones[skeleton.bones[i].name];
				orderedCloneBones.push(cloneBone);
			}
			cloneSkinnedMesh.bind(
				new Skeleton(orderedCloneBones, skeleton.boneInverses),
				cloneSkinnedMesh.matrixWorld);
		}
		
		return clone;

	}
    
    get randomWaypoint(){
		const index = Math.floor(Math.random()*this.waypoints.length);
		return this.waypoints[index];
	}

    update(dt){
        this.npcs.forEach( npc => npc.update(dt) );
    }
}

export { NPCHandler };