var Ball = function (x, y, z, name, color) {
  this.color = typeof color === 'undefined' ? 0xcc0000 : color; //default color
  this.texture = 'images/balls/' + name + '.png';

  this.mesh = this.createMesh(x,y,z);
  this.sphere = new THREE.Sphere(this.mesh.position, Ball.RADIUS); //used for guiding line intersection detecting
  scene.add(this.mesh);

  this.rigidBody = this.createBody(x,y,z);
  world.addBody(this.rigidBody);
  this.name = name;
  this.fallen = false;
};

Ball.RADIUS = 5.715 / 2; // cm
Ball.MASS = 0.170; // kg
Ball.contactMaterial = new CANNON.Material("ballMaterial");

/** Load env map for the ball.
  TODO: find a nicer place to do this. */
Ball.envMapUrls = [
  'images/skybox1/px.png', // positive x
  'images/skybox1/nx.png', // negative x
  'images/skybox1/py.png', // positive y
  'images/skybox1/ny.png', // negative y
  'images/skybox1/pz.png', // positive z
  'images/skybox1/nz.png'  // negative z
];

var cubeTextureLoader = new THREE.CubeTextureLoader();
Ball.envMap = cubeTextureLoader.load(Ball.envMapUrls, function (tex) {
  Ball.envMap = tex;
});

Ball.prototype.onEnterHole = function () {
  this.rigidBody.velocity = new CANNON.Vec3(0);
  this.rigidBody.angularVelocity = new CANNON.Vec3(0);
  world.removeBody(this.rigidBody);
  eightballgame.coloredBallEnteredHole(this.name);
};

Ball.prototype.createBody = function (x,y,z) {
  var sphereBody = new CANNON.Body({
    mass: Ball.MASS, // kg
    position: new CANNON.Vec3(x,y,z), // m
    shape: new CANNON.Sphere(Ball.RADIUS),
    material: Ball.contactMaterial
  });

  sphereBody.linearDamping = sphereBody.angularDamping = 0.5; // Hardcode
  sphereBody.allowSleep = true;

  // Sleep parameters
  sphereBody.sleepSpeedLimit = 0.5; // Body will feel sleepy if speed< 0.05 (speed == norm of velocity)
  sphereBody.sleepTimeLimit = 0.1; // Body falls asleep after 1s of sleepiness

  return sphereBody;
};

Ball.prototype.createMesh = function (x,y,z) {
  var geometry = new THREE.SphereGeometry(Ball.RADIUS, 16, 16);
  var material = new THREE.MeshPhongMaterial({
    specular: 0xffffff,
    shininess: 140,
    reflectivity: 0.1,
    envMap: Ball.envMap,
    combine: THREE.AddOperation,
    shading: THREE.SmoothShading
  });

  if (typeof this.texture === 'undefined') {
    material.color = new THREE.Color(this.color);
  } else {
    textureLoader.load(this.texture, function (tex) {
      material.map = tex;
      material.needsUpdate = true;
    });
  }

  var sphere = new THREE.Mesh(geometry, material);

  sphere.position.set(x,y,z);

  sphere.castShadow = true;
  sphere.receiveShadow = true;

  return sphere;
};

Ball.prototype.tick = function (dt) {
  this.mesh.position.copy(this.rigidBody.position);
  this.mesh.quaternion.copy(this.rigidBody.quaternion);

  // Has the ball fallen into a hole?
  if (this.rigidBody.position.y < -4 * Ball.RADIUS && !this.fallen) {
    this.fallen = true;
    this.onEnterHole();
  }
};
