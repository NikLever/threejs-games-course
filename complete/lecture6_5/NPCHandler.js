import {Player} from './NPC.js';
import {GLTFLoader} from '../../libs/three126/GLTFLoader.js';
import {Skeleton} from '../../libs/three126/three.module.js';

class NPCHandler{
    constructor( game ){
        this.game = game;
		this.loadingBar = this.game.loadingBar;
        this.waypoints = game.waypoints;
        this.load();
    }

    load(){
        
		const loader = new GLTFLoader().setPath(`${this.game.assetsPath}factory/`);
		
		// Load a GLTF resource
		loader.load(
			// resource URL
			`swat-guy-rifle.glb`,
			// called when the resource is loaded
			gltf => {
				const gltfs = [gltf];
				
                for(let i=0; i<3; i++) gltfs.push(this.cloneGLTF(gltf));
				
				this.npcs = [];
				
				gltfs.forEach(gltf => {
					const object = gltf.scene.children[0];

					object.traverse(function(child){
						if (child.isMesh){
							child.castShadow = true;
						}
					});

					const options = {
						object: object,
						speed: 0.8,
						animations: gltf.animations,
						clip: gltf.animations[0],
						app: this.game,
						waypoints: this.waypoints,
						zone: 'factory',
						name: 'swat-guy',
						npc: true
					};

					const npc = new Player(options);

					const scale = 1;
					npc.object.scale.set(scale, scale, scale);

					npc.object.position.copy(this.randomWaypoint);
					npc.newPath(this.randomWaypoint);
					
					this.npcs.push(npc);
					
				});

				this.loadingBar.visible = false;

				this.game.startRendering();
			},
			// called while loading is progressing
			xhr => {

				this.loadingBar.progress = (xhr.loaded / xhr.total)*0.5 + 0.5;

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