'use strict';

Physijs.scripts.worker = 'libs/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var initScene, render, createShape,
  renderer, scene, light, ground, ground_material, camera, dae;
var monkies = [];

initScene = function() {

  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMapEnabled = true;
  renderer.shadowMapSoft = true;
  document.getElementById('viewport').appendChild(renderer.domElement);


  scene = new Physijs.Scene({
    fixedTimeStep: 1 / 120
  });
  scene.setGravity(new THREE.Vector3(0, -30, 0));
  scene.addEventListener(
    'update',
    function() {
      scene.simulate(undefined, 2);
    }
  );

  camera = new THREE.PerspectiveCamera(
    35,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(60, 50, 60);
  camera.lookAt(scene.position);
  scene.add(camera);
  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  // Light
  light = new THREE.DirectionalLight(0xFFFFFF);
  light.position.set(20, 40, -15);
  light.target.position.copy(scene.position);
  light.castShadow = true;
  light.shadowCameraLeft = -60;
  light.shadowCameraTop = -60;
  light.shadowCameraRight = 60;
  light.shadowCameraBottom = 60;
  light.shadowCameraNear = 20;
  light.shadowCameraFar = 200;
  light.shadowBias = -.0001
  light.shadowMapWidth = light.shadowMapHeight = 2048;
  light.shadowDarkness = .7;
  scene.add(light);

  // Materials
  ground_material = Physijs.createMaterial(
    new THREE.MeshLambertMaterial({
      map: THREE.ImageUtils.loadTexture('images/rocks.jpg')
    }),
    .8, // high friction
    .4 // low restitution
  );
  ground_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping;
  ground_material.map.repeat.set(2.5, 2.5);

  // Ground
  ground = new Physijs.BoxMesh(
    new THREE.CubeGeometry(50, 1, 50),
    //new THREE.PlaneGeometry(50, 50),
    ground_material,
    0 // mass
  );
  ground.receiveShadow = true;
  scene.add(ground);

  // Bumpers
  var bumper,
    bumper_geom = new THREE.CubeGeometry(2, 1, 50);

  bumper = new Physijs.BoxMesh(bumper_geom, ground_material, 0, {
    restitution: .2
  });
  bumper.position.y = 1;
  bumper.position.x = -24;
  bumper.receiveShadow = true;
  bumper.castShadow = true;
  scene.add(bumper);

  bumper = new Physijs.BoxMesh(bumper_geom, ground_material, 0, {
    restitution: .2
  });
  bumper.position.y = 1;
  bumper.position.x = 24;
  bumper.receiveShadow = true;
  bumper.castShadow = true;
  scene.add(bumper);

  bumper = new Physijs.BoxMesh(bumper_geom, ground_material, 0, {
    restitution: .2
  });
  bumper.position.y = 1;
  bumper.position.z = -24;
  bumper.rotation.y = Math.PI / 2;
  bumper.receiveShadow = true;
  bumper.castShadow = true;
  scene.add(bumper);

  bumper = new Physijs.BoxMesh(bumper_geom, ground_material, 0, {
    restitution: .2
  });
  bumper.position.y = 1;
  bumper.position.z = 24;
  bumper.rotation.y = Math.PI / 2;
  bumper.receiveShadow = true;
  bumper.castShadow = true;
  scene.add(bumper);

  requestAnimationFrame(render);
  scene.simulate();

  createShape();

  var loader = new THREE.ColladaLoader();
  loader.options.convertUpAxis = true;
  loader.load('scene1.dae', function(collada) {
    dae = collada.scene;
    dae.children.forEach(function(obj) {
      var mesh = obj.children[0];
      if (mesh.type == "Mesh" && obj.name != "Grid") {
        var item = new Physijs.ConvexMesh(mesh.geometry, mesh.material);
        item.position.copy(obj.position);
        scene.add(item);
        monkies.push(item);
      }else if(mesh.type == "Mesh" && obj.name == "Grid"){
        var item = new Physijs.ConvexMesh(mesh.geometry, mesh.material,0);
        item.position.copy(obj.position);
        scene.add(item);
        monkies.push(item);
      }
      //scene.add( dae );
    });
  });

};

render = function() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
};

createShape = (function() {
  var addshapes = true,
    shapes = 0,
    box_geometry = new THREE.CubeGeometry(3, 3, 3),
    sphere_geometry = new THREE.SphereGeometry(1.5, 32, 32),
    cylinder_geometry = new THREE.CylinderGeometry(2, 2, 1, 32),
    cone_geometry = new THREE.CylinderGeometry(0, 2, 4, 32),
    octahedron_geometry = new THREE.OctahedronGeometry(1.7, 1),
    torus_geometry = new THREE.TorusKnotGeometry(1.7, .2, 32, 4),
    doCreateShape;

  setTimeout(
    function addListener() {
        setTimeout(addListener);
    }
  );

  doCreateShape = function() {
    var shape, material = new THREE.MeshLambertMaterial({
      opacity: 1,
      transparent: true
    });

    switch (Math.floor(Math.random() * 6)) {
      case 0:
        shape = new Physijs.BoxMesh(
          box_geometry,
          material
        );
        break;

      case 1:
        shape = new Physijs.SphereMesh(
          sphere_geometry,
          material,
          undefined, {
            restitution: Math.random() * 1.5
          }
        );
        break;

      case 2:
        shape = new Physijs.CylinderMesh(
          cylinder_geometry,
          material
        );
        break;

      case 3:
        shape = new Physijs.ConeMesh(
          cone_geometry,
          material
        );
        break;

      case 4:
        shape = new Physijs.ConvexMesh(
          octahedron_geometry,
          material
        );
        break;

      case 5:
        shape = new Physijs.ConvexMesh(
          torus_geometry,
          material
        );
        break;
    }

    shape.material.color.setRGB(Math.random() * 100 / 100, Math.random() * 100 / 100, Math.random() * 100 / 100);
    shape.castShadow = true;
    shape.receiveShadow = true;

    shape.position.set(
      Math.random() * 30 - 15,
      20,
      Math.random() * 30 - 15
    );

    shape.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    if (addshapes) {
      shape.addEventListener('ready', createShape);
    }
    scene.add(shape);


  };

  return function() {
    setTimeout(doCreateShape, 3000);
  };
})();

window.onload = initScene;
