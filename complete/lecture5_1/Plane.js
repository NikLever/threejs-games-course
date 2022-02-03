import { Vector3 } from '../../libs/three137/three.module.js';
import { GLTFLoader } from '../../libs/three137/GLTFLoader.js';

class Plane{
    constructor(game){
        this.assetsPath = game.assetsPath;
        this.loadingBar = game.loadingBar;
        this.game = game;
        this.scene = game.scene;
        this.load();
        this.tmpPos = new Vector3();
    }

    get position(){
        if (this.plane!==undefined) this.plane.getWorldPosition(this.tmpPos);
        return this.tmpPos;
    }

    set visible(mode){
        this.plane.visible = mode;
    }

    load(){
    	const loader = new GLTFLoader( ).setPath(`${this.assetsPath}plane/`);
        this.ready = false;
        
		// Load a glTF resource
		loader.load(
			// resource URL
			'microplane.glb',
			// called when the resource is loaded
			gltf => {

				this.scene.add( gltf.scene );
                this.plane = gltf.scene;
                this.velocity = new Vector3(0,0,0.1);
                
                this.propeller = this.plane.getObjectByName("propeller");

                this.ready = true;
    
			},
			// called while loading is progressing
			xhr => {

				this.loadingBar.update('plane', xhr.loaded, xhr.total );
				
			},
			// called when loading has errors
			err => {

				console.error( err );

			}
		);
	}	

    update(time){
        if (this.propeller !== undefined) this.propeller.rotateZ(1);

        this.plane.rotation.set(0, 0, Math.sin(time*3)*0.2, 'XYZ');
        this.plane.position.y = Math.cos(time) * 1.5;

    }
}

export { Plane };