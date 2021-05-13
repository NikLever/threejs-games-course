import { Vector2, Raycaster } from '../../libs/three128/three.module.js';

class WaypointHelper{
    constructor( navmesh, camera ){
        this.camera = camera;
        this.mouse = new Vector2();
        this.raycaster = new Raycaster();
        this.navmesh = navmesh;
        document.addEventListener( 'mousedown', this.onMouseDown.bind(this));
    }

    onMouseDown(evt){
        this.mouse.x = ( evt.clientX / window.innerWidth ) * 2 - 1;
	    this.mouse.y = - ( evt.clientY / window.innerHeight ) * 2 + 1;

	    // update the picking ray with the camera and mouse position
	    this.raycaster.setFromCamera( this.mouse, this.camera );

	    // calculate objects intersecting the picking ray
	    const intersects = this.raycaster.intersectObject( this.navmesh );

	    if (intersects.length >0 ) {

		    console.log(intersects[0].point);

	    }
    }
}

export { WaypointHelper };