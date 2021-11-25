import * as CANNON from '../../libs/cannon-es.js';

class Table{

    static LENGTH = 2.7432;
    static WIDTH = 1.3716;
    static HEIGHT = 0.06;
    static FLOOR_MATERIAL = new CANNON.Material('floorMaterial');
 
    constructor(game){
        const shape = new CANNON.Box(new CANNON.Vec3( Table.LENGTH/2, 0.1, Table.WIDTH/2));
        const body = new CANNON.Body({
            mass: 0, // mass == 0 makes the body static
            material: Table.FLOOR_MATERIAL,
            shape
        });
        body.position.y = -0.1;
        game.world.addBody(body);
        game.helper.addVisual(body, 0x00FF00, false, true);
        this.rigidBody = body;
    }

}

export { Table };