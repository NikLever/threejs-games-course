import * as THREE from '../../libs/three137/three.module.js';
import * as CANNON from '../../libs/cannon-es.js';
import { CannonHelper } from '../../libs/CannonHelper.js';
import { OrbitControls } from '../../libs/three137/OrbitControls.js';

 class Game{
   constructor(){
     this.initThree();
     this.initWorld();
     this.initScene();
   }

   initThree(){
    const container = document.createElement( 'div' );
    document.body.appendChild( container );
    
    this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 20 );
    this.camera.position.set( 0, 4, 5 );
    
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xaaaaaa );

    const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 0.3);
    this.scene.add(ambient);
    
    const light = new THREE.DirectionalLight();
    light.position.set( 0.2, 1, 0);
    light.castShadow = true;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    const size = 10;
    light.shadow.camera.top = size;
    light.shadow.camera.right = size;
    light.shadow.camera.bottom = -size;
    light.shadow.camera.left = -size;
    light.shadow.camera.near = 0.2;
    light.shadow.camera.far = 10;
    this.scene.add(light);
  
    this.renderer = new THREE.WebGLRenderer({ antialias: true } );
    this.renderer.shadowMap.enabled = true;
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( this.renderer.domElement );
    
    const controls = new OrbitControls( this.camera, this.renderer.domElement );
    
    this.renderer.setAnimationLoop(this.render.bind(this));

    window.addEventListener('resize', this.resize.bind(this) );
  }

   initWorld() {
    const world = new CANNON.World();
    world.gravity.set(0, -10, 0);

    this.helper = new CannonHelper( this.scene, world);

    this.world = world;
  }

  random(min, max){
    const range = max - min;
    return Math.random() * range + min; 
  }
      // Spheres
  initScene(){
    // Static ground plane
    const groundShape = new CANNON.Plane()
    const groundBody = new CANNON.Body({ mass: 0 })
    groundBody.addShape(groundShape)
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
    this.world.addBody(groundBody)
    this.helper.addVisual(groundBody);

    const size = 0.4;
    const bodies = [];
    let i = 0
    setInterval(() => {
      // Sphere
      i++;
      const sphereShape = new CANNON.Sphere(size)
      const sphereBody = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(this.random(-0.1, 0.1), 4, this.random(-0.1, 0.1)),
      })
      sphereBody.addShape(sphereShape)
      this.world.addBody(sphereBody)
      this.helper.addVisual(sphereBody, 0xFF0000);
      bodies.push(sphereBody)

      if (bodies.length > 80) {
        const bodyToKill = bodies.shift()
        this.helper.removeVisual(bodyToKill)
        this.world.removeBody(bodyToKill)
      }
    }, 300);
  }

  resize(){
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( window.innerWidth, window.innerHeight );  
  }

  render( ) {   
    this.world.step(0.0167);
    this.helper.update();
    this.renderer.render( this.scene, this.camera );
  }
}

export { Game };