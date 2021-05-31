import { 
        Mesh, 
        CylinderGeometry, 
        MeshBasicMaterial, 
        Raycaster, 
        Vector3, 
        Quaternion
    } from '../../libs/three128/three.module.js';
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
        /*[];
        this.game.npcHandler.npcs.forEach( npc => {
            let found = false;
            npc.object.traverse( child => {
                if ( !found && child.isMesh ){
                    if (child.material.name == 'Ch15_body'){
                        this.npcs.push(child);
                        child.userData.controller = npc;
                        found = true;
                    }
                }
            })
        });

        let found = false;
        this.game.user.object.traverse( child => {
            if ( !found && child.isMesh){
                if (child.material.name == 'SpacePirate_M' ){
                    this.user = child;
                    child.userData.controller = this.game.user;
                    found = true;
                }
            }
        }); */
        this.user = this.game.user;

        //this.raycaster = new Raycaster();
        this.forward = new Vector3( 0, 0, -1 );
        this.xAxis = new Vector3( 1, 0, 0 );
        this.tmpQuat = new Quaternion();
    }

    createBullet( pos, quat, user=false){
        const bullet = this.bullet.clone();
        bullet.position.copy(pos);
        bullet.quaternion.copy(quat);
        bullet.userData.targetType = (user) ? 1 : 2;
        bullet.userData.distance = 0;
        this.scene.add(bullet);
        this.bullets.push(bullet);
    }

    update(dt){
        this.bullets.forEach( bullet => {
            /*bullet.getWorldQuaternion( this.tmpQuat );
            this.raycaster.ray.direction.set(1,0,0).applyQuaternion( this.tmpQuat );
            this.raycaster.ray.origin.copy(bullet.position);

            const dist = dt * 15;
            let intersects;

            if (bullet.userData.targetType==1){
                intersects = this.raycaster.intersectObject(this.user);
            }else{
                intersects = this.raycaster.intersectObjects(this.npcs);
            }*/
            let hit = false;
            const p1 = bullet.position;
            let target;

            if (bullet.userData.targetType==1){
                const p2 = this.user.position.clone();
                p2.y += 1;
                hit = sphereIntersectsCylinder(p1.x, p1.y, p1.z, 0.01, p2.x, p2.y, p2.z, 1.9, 0.4);
                target = this.user;
            }else{
                this.npcs.some( npc => {
                    if (!npc.dead){
                        const p2 = npc.position.clone();
                        p2.y += 1.6;
                        hit = sphereIntersectsCylinder(p1.x, p1.y, p1.z, 0.01, p2.x, p2.y, p2.z, 3.2, 0.5);
                        target = npc;
                        return true;
                    }
                })
            }

            if (hit){
                target.action = 'shot';
                bullet.userData.remove = true;
            }else{
                const dist = dt * 15;
                bullet.translateX(dist);
                bullet.userData.distance += dist;
                bullet.userData.remove = (bullet.userData.distance > 50);
            }
        });

        let found = false;
        do{
            let remove;
            found = this.bullets.some( bullet => {
                if (bullet.userData.remove){
                    remove = bullet;
                    return true;
                }
            });
            if (found){
                const index = this.bullets.indexOf(remove);
                if (index!==-1) this.bullets.splice(index, 1);
            }
            
        }while(found);
    }
}

export { BulletHandler };