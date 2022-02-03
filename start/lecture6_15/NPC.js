import * as THREE from '../../libs/three137/three.module.js';
import { SFX } from '../../libs/SFX.js';

class NPC{
	constructor(options){
		const fps = options.fps || 30; //default fps
		
		this.name = options.name | 'NPC';
		
		this.animations = {};	
		
		options.app.scene.add(options.object);
		
		this.object = options.object;
		this.pathLines = new THREE.Object3D();
		this.pathColor = new THREE.Color(0xFFFFFF);
		options.app.scene.add(this.pathLines);

		this.app = options.app;
		this.game = options.app;

		this.factory = options.app.factory;

		this.showPath = options.showPath | false;

        this.waypoints = options.waypoints;

        this.dead = false;
		
        this.speed = options.speed;
        
        
        if (options.app.pathfinder){
            this.pathfinder = options.app.pathfinder;
            this.ZONE = options.zone;
            this.navMeshGroup = this.pathfinder.getGroup(this.ZONE, this.object.position);	
        }
		
		const pt = this.object.position.clone();
		pt.z += 10;
		this.object.lookAt(pt);

		this.rifle = options.rifle;
		this.aim = options.aim;
		this.enemy = this.app.user.root;
		this.isFiring = false;
		this.raycaster = new THREE.Raycaster();
		this.forward = new THREE.Vector3(0, 0, 1);
		this.tmpVec = new THREE.Vector3();
		this.tmpQuat = new THREE.Quaternion();
        this.aggro = false;
		
        if (options.animations){
            this.mixer = new THREE.AnimationMixer(options.object);
            options.animations.forEach( (animation) => {
                this.animations[animation.name.toLowerCase()] = animation;
            })
        }

		this.initRifleDirection();
	}

	initRifleDirection(){
		this.rifleDirection = {};

		this.rifleDirection.idle = new THREE.Quaternion(-0.044, -0.061, 0.865, 0.495);
		this.rifleDirection.firing = new THREE.Quaternion(-0.147, -0.040, 0.784, 0.600);
		this.rifleDirection.walking = new THREE.Quaternion( 0.046, -0.017, 0.699, 0.712);
		this.rifleDirection.shot = new THREE.Quaternion(-0.133, -0.144, -0.635, 0.747);
	}

	initSounds(){
		const assetsPath = `${this.app.assetsPath}factory/sfx/`;
		this.sfx = new SFX(this.app.camera, assetsPath, this.app.listener);
		this.sfx.load('footsteps', true, 0.6, this.object);
		this.sfx.load('groan', false, 0.6, this.object);
		this.sfx.load('shot', false, 0.6, this.object);
	}

	reset(){
		this.dead = false;
		this.object.position.copy(this.randomWaypoint);
		let pt = this.randomWaypoint;
		let count = 0;
		while(this.object.position.distanceToSquared(pt)<1 && count<10){
			pt = this.randomWaypoint;
			count++;
		}
		this.newPath(pt);
	}

    get randomWaypoint(){
		const index = Math.floor(Math.random()*this.waypoints.length);
		return this.waypoints[index];
	}

	setTargetDirection(pt){
		const player = this.object;
		pt.y = player.position.y;
		const quaternion = player.quaternion.clone();
		player.lookAt(pt);
		this.quaternion = player.quaternion.clone();
		player.quaternion.copy(quaternion);
	}
	
	newPath(pt){
        const player = this.object;
        
        if (this.pathfinder===undefined){
            this.calculatedPath = [ pt.clone() ];
            //Calculate target direction
            this.setTargetDirection( pt.clone() );
            this.action = 'walking';
            return;
        }
        
		if (this.sfx) this.sfx.play('footsteps');
		//console.log(`New path to ${pt.x.toFixed(1)}, ${pt.y.toFixed(2)}, ${pt.z.toFixed(2)}`);	

		const targetGroup = this.pathfinder.getGroup(this.ZONE, pt);
		const closestTargetNode = this.pathfinder.getClosestNode(pt, this.ZONE, targetGroup);
		
		// Calculate a path to the target and store it
		this.calculatedPath = this.pathfinder.findPath(player.position, pt, this.ZONE, this.navMeshGroup);

		if (this.calculatedPath && this.calculatedPath.length) {
			this.action = 'walking';
			
			this.setTargetDirection( this.calculatedPath[0].clone() );
			
			if (this.showPath){
				if (this.pathLines) this.app.scene.remove(this.pathLines);

				const material = new THREE.LineBasicMaterial({
					color: this.pathColor,
					linewidth: 2
				});

				const points = [player.position];
				
				// Draw debug lines
				this.calculatedPath.forEach( function(vertex){
					points.push(vertex.clone());
				});

				let geometry = new THREE.BufferGeometry().setFromPoints( points );

				this.pathLines = new THREE.Line( geometry, material );
				this.app.scene.add( this.pathLines );

				// Draw debug spheres except the last one. Also, add the player position.
				const debugPath = [player.position].concat(this.calculatedPath);

				debugPath.forEach(vertex => {
					geometry = new THREE.SphereGeometry( 0.2 );
					const material = new THREE.MeshBasicMaterial( {color: this.pathColor} );
					const node = new THREE.Mesh( geometry, material );
					node.position.copy(vertex);
					this.pathLines.add( node );
				});
			}
		} else {
			if (this.sfx) this.sfx.stop('footsteps');

			this.action = 'idle';
			
            if (this.pathfinder){
                const closestPlayerNode = this.pathfinder.getClosestNode(player.position, this.ZONE, this.navMeshGroup);
                const clamped = new THREE.Vector3();
                this.pathfinder.clampStep(
                    player.position, 
                    pt.clone(), 
                    closestPlayerNode, 
                    this.ZONE, 
                    this.navMeshGroup, 
                    clamped);
            }
            
			if (this.pathLines) this.app.scene.remove(this.pathLines);
		}
	}
	
	set action(name){
		if (this.actionName == name.toLowerCase()) return;
				
		const clip = this.animations[name.toLowerCase()];

		if (clip!==undefined){
			const action = this.mixer.clipAction( clip );
			if (name=='shot'){
				action.clampWhenFinished = true;
				action.setLoop( THREE.LoopOnce );
				this.dead = true;
				if (this.sfx){
					this.sfx.stop('footsteps');
					this.sfx.play('groan');
				}
				delete this.calculatedPath;
			}
			action.reset();
			const nofade = this.actionName == 'shot';
			this.actionName = name.toLowerCase();
			action.play();
			if (this.curAction){
				if (nofade){
					this.curAction.enabled = false;
				}else{
					this.curAction.crossFadeTo(action, 0.5);
				}
			}
			this.curAction = action;
		}
		if (this.rifle && this.rifleDirection){
			const q = this.rifleDirection[name.toLowerCase()];
			if (q!==undefined){
				const start = new THREE.Quaternion();
				start.copy(this.rifle.quaternion);
				this.rifle.quaternion.copy(q);
				this.rifle.rotateX(1.57);
				const end = new THREE.Quaternion();
				end.copy(this.rifle.quaternion);
				this.rotateRifle = { start, end, time:0 };
				this.rifle.quaternion.copy( start );
			}
		}
	}
	
	get position(){
		return this.object.position;
	}

	set firing(mode){
		this.isFiring = mode;
		if (mode){
			this.action = "firingwalk";
			this.bulletTime = this.app.clock.getElapsedTime();
		}else{
			this.newPath(this.randomWaypoint);
		}
	}

	shoot(){
		if (this.bulletHandler === undefined) this.bulletHandler = this.app.bulletHandler;
		this.aim.getWorldPosition(this.tmpVec);
		this.aim.getWorldQuaternion(this.tmpQuat);
		this.bulletHandler.createBullet( this.tmpVec, this.tmpQuat, true );
		this.bulletTime = this.app.clock.getElapsedTime();
		this.sfx.play('shot');
	}

	withinAggroRange(){
		
	}

	withinFOV( fov ){
		
	}

	pointAtEnemy(){
		 
	}

	seeEnemy(){
		
	}

	update(dt){
		const speed = (this.actionName=='firingwalk') ? this.speed*0.6 : this.speed;
		const player = this.object;
		
		if (this.mixer) this.mixer.update(dt);

		if (this.rotateRifle !== undefined){
			this.rotateRifle.time += dt;
			if (this.rotateRifle.time > 0.5){
				this.rifle.quaternion.copy( this.rotateRifle.end );
				delete this.rotateRifle;
			}else{
				this.rifle.quaternion.slerpQuaternions(this.rotateRifle.start, this.rotateRifle.end, this.rotateRifle.time * 2);
			}
		}

		//Add aggro code here

        if (this.calculatedPath && this.calculatedPath.length) {
            const targetPosition = this.calculatedPath[0];

            const vel = targetPosition.clone().sub(player.position);
            
            let pathLegComplete = (vel.lengthSq()<0.01);
            
            if (!pathLegComplete) {
                //Get the distance to the target before moving
                const prevDistanceSq = player.position.distanceToSquared(targetPosition);
                vel.normalize();
                // Move player to target
                if (this.quaternion) player.quaternion.slerp(this.quaternion, 0.1);
                player.position.add(vel.multiplyScalar(dt * speed));
                //Get distance after moving, if greater then we've overshot and this leg is complete
                const newDistanceSq = player.position.distanceToSquared(targetPosition);
                pathLegComplete = (newDistanceSq > prevDistanceSq);
            } 
            
            if (pathLegComplete){
                // Remove node from the path we calculated
                this.calculatedPath.shift();
                if (this.calculatedPath.length==0){
                    if (this.waypoints!==undefined){
                        this.newPath(this.randomWaypoint);
                    }else{
                        player.position.copy( targetPosition );
                        this.action = 'idle';
                    }
                }else{
                    this.setTargetDirection( this.calculatedPath[0].clone() );
                }
            }
        }else{
            if (!this.dead && this.waypoints!==undefined && !this.aggro) this.newPath(this.randomWaypoint);
        }
    }
}

export { NPC };