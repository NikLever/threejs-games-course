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
            let hit = false;
            const p1 = bullet.position.clone();
            let target;
            const dist = dt * 15;
            //Move bullet to next position
            bullet.translateX(dist);
            const p3 = bullet.position.clone();
            bullet.position.copy(p1);
            const iterations = 1;
            const p = this.tmpVec3;

            for(let i=1; i<=iterations; i++){
                p.lerpVectors(p1, p3, i/iterations);
                if (bullet.userData.targetType==1){
                    const p2 = this.user.position.clone();
                    p2.y += 1.2;
                    hit = sphereIntersectsCylinder(p.x, p.y, p.z, 0.01, p2.x, p2.y, p2.z, 2.4, 0.4);
                    if (hit) target = this.user;
                }else{
                    this.npcs.some( npc => {
                        if (!npc.dead){
                            const p2 = npc.position.clone();
                            p2.y += 1.5;
                            hit = sphereIntersectsCylinder(p.x, p.y, p.z, 0.01, p2.x, p2.y, p2.z, 3.0, 0.5);
                            if (hit){
                                target = npc;
                                return true;
                            }
                        }
                    })
                }
                if (hit) break;
            }

            if (hit){
                target.action = 'shot';
                bullet.userData.remove = true;
            }else{
                bullet.translateX(dist);
                bullet.rotateX(dt * 0.3);
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
                this.scene.remove(remove);
            }
            
        }while(found);
    }
}

export { BulletHandler };