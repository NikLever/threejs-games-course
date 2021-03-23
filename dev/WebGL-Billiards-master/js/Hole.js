var Hole = function (x, y, z, rotation) {
  //z = z -4.8;
  // The "wall" arch
  this.arch1 = new Arch({
    position: {x: x, y: y, z: z},
    no_of_boxes: 6,
    box_height: 6,
    box_autowidth: true,
    box_thickness: 0.1
  });
  // the "floor" arch
  this.arch2 = new Arch({
    position: {x: x, y: y - 1, z: z},
    no_of_boxes: 6,
    box_height: 1,
    box_width: 2.5,
    box_thickness: 3
  });

  this.arch1.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI - rotation);
  this.arch2.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -rotation);

  world.addBody(this.arch1.body);
  world.addBody(this.arch2.body);
  if (debug) {
    addCannonVisual(this.arch1.body);
    addCannonVisual(this.arch2.body);
  }
};
