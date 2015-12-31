'use strict';

Physijs.scripts.worker = 'libs/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var initScene, render, createShape, player,
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
  //var controls = new THREE.OrbitControls(camera, renderer.domElement);
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

  //createShape();

  var loader = new THREE.ColladaLoader();
  loader.options.convertUpAxis = true;
  loader.load('scene1.dae', function(collada) {
    dae = collada.scene;
    dae.children.forEach(function(obj) {
      var mesh = obj.children[0];
      if(mesh.type == "Mesh" && obj.name == "Player"){
        console.log("Loading Player");
        player = new Physijs.BoxMesh(mesh.geometry, mesh.material);
        player.position.copy(obj.position);
        player.velocity = new THREE.Vector3();
        player.setLinearVelocity(player.velocity);
        player.castShadow = true;
        player.speed = 10;
        player.forward = false;
        player.back = false;
        player.left = false;
        player.right = false;
        scene.add(player);
      }else if(mesh.type == "Mesh" && obj.name == "Plane"){
        console.log("Plane Found");
        var item = new Physijs.ConcaveMesh(mesh.geometry, mesh.material,0);
        item.position.copy(obj.position);
        item.castShadow = true;
        scene.add(item);
        monkies.push(item);
      }else if (mesh.type == "Mesh") {
        var item = new Physijs.ConvexMesh(mesh.geometry, mesh.material);
        item.position.copy(obj.position);
        item.castShadow = true;
        scene.add(item);
        monkies.push(item);
      }       //scene.add( dae );
    });
  });

};

render = function() {
  requestAnimationFrame(render);
  scene.simulate();
  renderer.render(scene, camera);
  move();
};


function move(){
  if(player.forward){
    var v = player.getWorldDirection();
    v.x *= player.speed;
    v.z *= player.speed;
    player.setLinearVelocity(v);    
  }

  if(player.back){
    var v = player.getWorldDirection();
    v.x *= -player.speed;
    v.z *= -player.speed;
    player.setLinearVelocity(v);
  }

  if(player.left){
    player.setAngularVelocity(new THREE.Vector3(0,5,0));
  }

  if(player.right){
    player.setAngularVelocity(new THREE.Vector3(0,-5,0));
  }
}

window.onload = initScene;
document.addEventListener('keydown', function( ev ) {
    //console.log(ev.keyCode); //get keycode in console
  switch ( ev.keyCode ) {
    case 38: // forward
      player.forward = true;
      break;    
    case 40: // back
      player.back = true;
      break;    
    case 37: // left
      player.left = true;
      break;
    case 39: // right
      player.right = true;
      break;
    case 32: // Spacebar to flip player back over
      player.lookAt(player.getWorldRotation());
      player.__dirtyRotation = true;
      break;
    case 90:
      var x=new THREE.Vector3(50,0,0);
      player.setAngularVelocity(x);
  }

});

document.addEventListener('keyup', function( ev ) {
    //console.log(ev.keyCode); //get keycode in console
  switch ( ev.keyCode ) {
    case 38: // forward
      player.forward = false;
      break;
    case 40: // back
      player.back = false;
      break;
    case 37: // left
      player.left = false;
      break;
    case 39: // right
      player.right = false;
      break;

  }

});
