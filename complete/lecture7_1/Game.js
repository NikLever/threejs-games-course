import * as THREE from '../../libs/three128/three.module.js';
import * as CANNON from '../../libs/cannon-es.js';
import { CannonHelper } from '../../libs/CannonHelper.js';
import { OrbitControls } from '../../libs/three128/OrbitControls.js';

 class Game{
   constructor(){
     this.initThree();
     this.initWorld();
     this.initScene();
   }

   initThree(){
    const container = document.createElement( 'div' );
    document.body.appendChild( container );
    
    this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 100 );
    this.camera.position.set( 0, 20, 30 );
    
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xaaaaaa );

    const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 0.3);
    this.scene.add(ambient);
    
    const light = new THREE.DirectionalLight();
    light.position.set( 0.2, 1, 1);
    this.scene.add(light);
  
    this.renderer = new THREE.WebGLRenderer({ antialias: true } );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( this.renderer.domElement );
    
    const controls = new OrbitControls( this.camera, this.renderer.domElement );
    
    this.renderer.setAnimationLoop(this.render.bind(this));

    window.addEventListener('resize', this.resize.bind(this) );
  }

   initWorld() {
    const world = new CANNON.World();
    world.gravity.set(0, -50, 0)

    // Max solver iterations: Use more for better force propagation, but keep in mind that it's not very computationally cheap!
    world.solver.iterations = 5

    // Tweak contact properties.
    // Contact stiffness - use to make softer/harder contacts
    world.defaultContactMaterial.contactEquationStiffness = 5e6

    // Stabilization time in number of timesteps
    world.defaultContactMaterial.contactEquationRelaxation = 10

    // Since we have many bodies and they don't move very much, we can use the less accurate quaternion normalization
    world.quatNormalizeFast = true
    world.quatNormalizeSkip = 3 // ...and we do not have to normalize every step.

    // Static ground plane
    const groundShape = new CANNON.Plane()
    const groundBody = new CANNON.Body({ mass: 0 })
    groundBody.addShape(groundShape)
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
    world.addBody(groundBody)

    this.helper = new CannonHelper( this.scene, world);
    this.helper.addVisual(groundBody);

    this.world = world;
  }
      // Spheres
  initScene(){
    // Plane -x
    const planeShapeXmin = new CANNON.Plane()
    const planeXmin = new CANNON.Body({ mass: 0 })
    planeXmin.addShape(planeShapeXmin)
    planeXmin.quaternion.setFromEuler(0, Math.PI / 2, 0)
    planeXmin.position.set(-5, 0, 0)
    this.world.addBody(planeXmin)

    // Plane +x
    const planeShapeXmax = new CANNON.Plane()
    const planeXmax = new CANNON.Body({ mass: 0 })
    planeXmax.addShape(planeShapeXmax)
    planeXmax.quaternion.setFromEuler(0, -Math.PI / 2, 0)
    planeXmax.position.set(5, 0, 0)
    this.world.addBody(planeXmax)

    // Plane -z
    const planeShapeZmin = new CANNON.Plane()
    const planeZmin = new CANNON.Body({ mass: 0 })
    planeZmin.addShape(planeShapeZmin)
    planeZmin.quaternion.setFromEuler(0, 0, 0)
    planeZmin.position.set(0, 0, -5)
    this.world.addBody(planeZmin)

    // Plane +z
    const planeShapeZmax = new CANNON.Plane()
    const planeZmax = new CANNON.Body({ mass: 0 })
    planeZmax.addShape(planeShapeZmax)
    planeZmax.quaternion.setFromEuler(0, Math.PI, 0)
    planeZmax.position.set(0, 0, 5)
    this.world.addBody(planeZmax)

    const size = 1
    const bodies = []
    let i = 0
    setInterval(() => {
      // Sphere
      i++;
      const sphereShape = new CANNON.Sphere(size)
      const sphereBody = new CANNON.Body({
        mass: 5,
        position: new CANNON.Vec3(-size * 2 * Math.sin(i), size * 2 * 7, size * 2 * Math.cos(i)),
      })
      sphereBody.addShape(sphereShape)
      this.world.addBody(sphereBody)
      this.helper.addVisual(sphereBody)
      bodies.push(sphereBody)

      if (bodies.length > 80) {
        const bodyToKill = bodies.shift()
        this.helper.removeVisual(bodyToKill)
        this.world.removeBody(bodyToKill)
      }
    }, 100);
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