import { Object3D, SphereGeometry, MeshBasicMaterial, Mesh } from '../../libs/three126/three.module.js';
import { GLTFLoader } from '../../libs/three126/GLTFLoader.js';

class Rifle{
    constructor(game, pos, heading){
        this.root = new Object3D();
        this.root.position.copy( pos );
        this.root.rotation.set( 0, heading, 0, 'XYZ' );

        this.addSphere();

        game.scene.add(this.root);
        this.load();
        this.loaded = 0;
        this.total = 100000000;
    }

    addSphere(){
        const geometry = new SphereGeometry( 0.1, 8, 8 );
        const material = new MeshBasicMaterial( { color: 0xFF0000 });
        const mesh = new Mesh( geometry, material );
        this.root.add(mesh);
    }

    get progress(){
        return this.loaded/this.total;
    }

    load(){
    	const loader = new GLTFLoader( ).setPath('../../assets/factory/');
        
        // Load a glTF resource
		loader.load(
			// resource URL
			'sniper-rifle.glb',
			// called when the resource is loaded
			gltf => {
				this.root.add( gltf.scene );
                this.rifle = gltf.scene;
                this.rifle.position.y = 1.5;
                this.rifle.rotateZ( Math.PI/2 );
                this.rifle.rotateX( Math.PI/2 );
                this.rifle.scale.set(0.1, 0.1, 0.1);
    		},
			// called while loading is progressing
			xhr => {

				this.loaded = xhr.loaded;
                this.total = xhr.total;
				
			},
			// called when loading has errors
			err => {

				console.error( err );

			}
		);
	}
}

export { Rifle };