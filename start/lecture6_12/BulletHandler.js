import { 
        Mesh, 
        CylinderGeometry, 
        MeshBasicMaterial, 
        Raycaster, 
        Vector3, 
        Quaternion
    } from '../../libs/three137/three.module.js';
import { sphereIntersectsCylinder } from '../../libs/Collisions.js';

class BulletHandler{
    constructor(game){
        this.game = game;
        this.scene = game.scene;
        const geometry = new CylinderGeometry(0.01, 0.01, 0.08);
        geometry.rotateX( Math.PI/2 );
        geometry.rotateY( Math.PI/2 );
        const material = new MeshBasicMaterial();
        this.bullet = new Mesh(geometry, material);

        this.bullets = [];

        this.npcs = this.game.npcHandler.npcs;
        
        this.user = this.game.user;

        this.forward = new Vector3( 0, 0, -1 );
        this.xAxis = new Vector3( 1, 0, 0 );
        this.tmpVec3 = new Vector3();
        this.tmpQuat = new Quaternion();
    }

    createBullet( pos, quat, user=false){
        
    }

    update(dt){
        
    }
}

export { BulletHandler };