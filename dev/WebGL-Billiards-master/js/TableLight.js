var TableLight = function (x,y,z) {
  this.spotlight = new THREE.SpotLight(0xffffe5, 1);

  this.spotlight.position.set(x, y, z);
  this.spotlight.target.position.set(x, 0, z); //the light points directly towards the xz plane
  this.spotlight.target.updateMatrixWorld();

  this.spotlight.castShadow = true;
  this.spotlight.shadowCameraFov = 110;
  this.spotlight.shadowCameraNear = 100;
  this.spotlight.shadowCameraFar = 170;
  this.spotlight.shadowMapWidth = 2048;
  this.spotlight.shadowMapHeight = 2048;

  scene.add(this.spotlight);

  if (debug) {
    this.shadowCam = new THREE.CameraHelper(this.spotlight.shadow.camera);
    scene.add(this.shadowCam);
  }
};
