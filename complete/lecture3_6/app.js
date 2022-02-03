import * as THREE from '../../libs/three137/three.module.js';
import { OrbitControls } from '../../libs/three137/OrbitControls.js';

class App{
	constructor(){
		const container = document.createElement( 'div' );
		document.body.appendChild( container );
        
		this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 100 );
		this.camera.position.set( 0, 0, 4 );
        
		this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0xaaaaaa );

		const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 0.3);
		this.scene.add(ambient);
        
        const light = new THREE.DirectionalLight();
        light.position.set( 0.2, 1, 1);
        this.scene.add(light);
			
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		container.appendChild( this.renderer.domElement );
		
        //Replace Box with Circle, Cone, Cylinder, Dodecahedron, Icosahedron, Octahedron, Plane, Sphere, Tetrahedron, Torus or TorusKnot
        //const geometry = new THREE.CircleGeometry(1, 32, 0, Math.PI);
        //const geometry = this.createStarGeometry();
        const geometry = this.createPolygonGeometry();
        const material = new THREE.MeshStandardMaterial( { color: 0xFF0000 });

        this.mesh = new THREE.Mesh( geometry, material );
        
        this.scene.add(this.mesh);
        
        const controls = new OrbitControls( this.camera, this.renderer.domElement );
        
        this.renderer.setAnimationLoop(this.render.bind(this));
    
        window.addEventListener('resize', this.resize.bind(this) );
	}
    
    createStarGeometry(innerRadius=0.4, outerRadius=0.8, points=5){
        const shape = new THREE.Shape();
        
        const PI2 = Math.PI * 2;
        const inc = PI2/(points*2);
        
        shape.moveTo( outerRadius, 0 );
        let inner = true;
        
        for( let theta=inc; theta<PI2; theta += inc){
            const radius = (inner) ? innerRadius : outerRadius;
            shape.lineTo( Math.cos(theta)*radius, Math.sin(theta)*radius);
            inner = !inner;
        }
        
        const extrudeSettings = {
	        steps: 1,
	        depth: 1,
            bevelEnabled: false
        };

        return new THREE.ExtrudeGeometry( shape, extrudeSettings );
    }

    createPolygonGeometry(radius=1, sides=6){
        const shape = new THREE.Shape();
        
        const PI2 = Math.PI * 2;
        const inc = PI2/sides;
        
        shape.moveTo( radius, 0 );
        let inner = true;
        
        for( let theta=inc; theta<PI2; theta += inc){
            shape.lineTo( Math.cos(theta)*radius, Math.sin(theta)*radius);
        }
        
        const extrudeSettings = {
	        steps: 1,
	        depth: radius * 0.25,
            bevelEnabled: false
        };

        return new THREE.ExtrudeGeometry( shape, extrudeSettings );
    }
    
    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );  
    }
    
	render( ) {   
        this.mesh.rotateY( 0.01 );
        this.renderer.render( this.scene, this.camera );
    }
}

export { App };