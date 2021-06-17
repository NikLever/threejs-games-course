import * as THREE from '../../libs/three128/three.module.js';
import * as CANNON from '../../libs/cannon-es.js';

let wireframeMaterial;

function createQuaternionFromAxisAngle(axis, angle) {
  const q = new CANNON.Quaternion();
  q.setFromAxisAngle(axis, angle);
  return q;
};

/*
  Adapted from cannon.demo.js:
  Helper to draw wireframes of collision bodies
*/
function addCannonVisual(body, scene, color=0xFFFFFF, wireframe=true) {
  wireframeMaterial = new THREE.MeshBasicMaterial({color: color, wireframe: true});
  
  let mesh;
  if (body instanceof CANNON.Body) {
    mesh = Cannonshape2mesh(body);
  }

  if (mesh) {
    //mesh.useQuaternion = true;
    scene.add(mesh);
  }

  return mesh;//
}

/** Adapted from cannon.demo.js:*/
function Cannonshape2mesh(body) {
  const obj = new THREE.Object3D();

  let l = 0;

  body.shapes.forEach (shape => {
    let mesh;
    let geometry;
    let v0, v1, v2;

    switch (shape.type) {
      case CANNON.Shape.types.SPHERE:
        geometry = new THREE.SphereBufferGeometry(shape.radius, 8, 8);
        mesh = new THREE.Mesh(geometry, wireframeMaterial);
        break;

      case CANNON.Shape.types.PLANE:
        geometry = new THREE.PlaneBufferGeometry(10, 10, 4, 4);
        mesh = new THREE.Object3D();
        const submesh = new THREE.Object3D();
        const ground = new THREE.Mesh(geometry, wireframeMaterial);
        ground.scale.set(100, 100, 100);
        submesh.add(ground);

        ground.receiveShadow = true;

        mesh.add(submesh);
        break;

      case CANNON.Shape.types.BOX:
        geometry = new THREE.BoxBufferGeometry(
          shape.halfExtents.x * 2,
          shape.halfExtents.y * 2,
          shape.halfExtents.z * 2
        );
        mesh = new THREE.Mesh(geometry, wireframeMaterial);
        break;

      case CANNON.Shape.types.CONVEXPOLYHEDRON:
        var geo = new THREE.Geometry();

        // Add vertices
        shape.vertices.forEach( v =>{
          geo.vertices.push(new THREE.Vector3(v.x, v.y, v.z));
        });

        shape.faces.forEach( face => {
          // add triangles
          const a = face[0];
          for (let j = 1; j < face.length - 1; j++) {
            const b = face[j];
            const c = face[j + 1];
            geo.faces.push(new THREE.Face3(a, b, c));
          }
        });

        geo.computeBoundingSphere();
        geo.computeFaceNormals();
        mesh = new THREE.Mesh(geo, wireframeMaterial);
        break;

      case CANNON.Shape.types.HEIGHTFIELD:
        geometry = new THREE.Geometry();

        v0 = new CANNON.Vec3();
        v1 = new CANNON.Vec3();
        v2 = new CANNON.Vec3();

        for (let xi = 0; xi < shape.data.length - 1; xi++) {
          for (let yi = 0; yi < shape.data[xi].length - 1; yi++) {
            for (let k = 0; k < 2; k++) {
              shape.getConvexTrianglePillar(xi, yi, k === 0);
              v0.copy(shape.pillarConvex.vertices[0]);
              v1.copy(shape.pillarConvex.vertices[1]);
              v2.copy(shape.pillarConvex.vertices[2]);
              v0.vadd(shape.pillarOffset, v0);
              v1.vadd(shape.pillarOffset, v1);
              v2.vadd(shape.pillarOffset, v2);
              geometry.vertices.push(
                new THREE.Vector3(v0.x, v0.y, v0.z),
                new THREE.Vector3(v1.x, v1.y, v1.z),
                new THREE.Vector3(v2.x, v2.y, v2.z)
              );
              var i = geometry.vertices.length - 3;
              geometry.faces.push(new THREE.Face3(i, i + 1, i + 2));
            }
          }
        }
        geometry.computeBoundingSphere();
        geometry.computeFaceNormals();
        mesh = new THREE.Mesh(geometry, wireframeMaterial);
        break;

      case CANNON.Shape.types.TRIMESH:
        const points = [];
        
        v0 = new CANNON.Vec3();
        v1 = new CANNON.Vec3();
        v2 = new CANNON.Vec3();

        for (let i = 0; i < shape.indices.length / 3; i++) {
          shape.getTriangleVertices(i, v0, v1, v2);
          points.push(
              new THREE.Vector3(v0.x, v0.y, v0.z),
              new THREE.Vector3(v1.x, v1.y, v1.z),
              new THREE.Vector3(v2.x, v2.y, v2.z)
          );
        }
        geometry = new THREE.BufferGeometry().setFromPoints( points );
        geometry.computeBoundingSphere();
        geometry.computeFaceNormals();

        mesh = new THREE.Mesh(geometry, wireframeMaterial);
        
        break;

      default:
        throw "Visual type not recognized: " + shape.type;
    }

    mesh.receiveShadow = false;
    mesh.castShadow = false;

    var o = body.shapeOffsets[l];
    var q = body.shapeOrientations[l];
    mesh.position.set(o.x, o.y, o.z);
    mesh.quaternion.set(q.x, q.y, q.z, q.w);

    obj.add(mesh);
    l++;
  });

  obj.position.copy(body.position);
  obj.quaternion.copy(body.quaternion);

  return obj;
}

export{ createQuaternionFromAxisAngle, addCannonVisual };
