// Set up global variables.
var scene, camera, renderer, json;
var models = [];
var lights = [];

getScene();
getInfo();
init();
animate();

function init() {

  // Create the scene and set the scene size.
  scene = new THREE.Scene();
  var WIDTH = window.innerWidth,
      HEIGHT = window.innerHeight;

  // Create a renderer
  renderer = Detector.webgl ? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
  renderer.setSize(WIDTH, HEIGHT);
  renderer.setClearColor( 0x222222 );
  document.body.appendChild(renderer.domElement);

  // Create a camera and add it to the scene.
  camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 20000);
  camera.position.set(0,0.4,-6);
  scene.add(camera);

  // Event listeners
  document.body.addEventListener("mousedown", fullscreen, false);
  window.addEventListener('resize', function() {
    var WIDTH = window.innerWidth,
        HEIGHT = window.innerHeight;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
  });

  //load model and lights
  loadScene(JScene);
  loadLight(-100,100,200);
  loadLight(100,-200,-100);

  // Add Controls.
  controls = new THREE.OrbitControls(camera, renderer.domElement);

}


function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();
}

function loadScene(JScene){
  var loader = new THREE.ObjectLoader();
  loader.load("models/" + JScene + ".json",function ( obj ) {
       scene.add( obj );
  });
}

function getVar(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function loadLight(x,y,z){ 
  // Create a light, set its position, and add it to the scene.
  var light = new THREE.PointLight(0xffffff);
  //var light = new THREE.AmbientLight(0x404040);
  light.position.set(x,y,z);
  lights.push(light);
  scene.add(light);
}

function getScene(){
  JScene = getVar("json");
  if(!JScene){
    JScene = "defaultScene.json";
  }
  JScene = JScene.split(".")[0];
}

function getInfo(){
  var info = getVar("info");
  if(info){
    $("#infoBox").html(info);
    $("#infoBox").fadeTo("slow",.2);
    $("#infoBox").hover(function(){
      $(this).fadeTo("slow",.5);
    },function(){
      $(this).fadeTo("slow",.2);
    });
  }
}

function fullscreen(){
  var element = document.body;
  element.requestFullscreen = element.requestFullscreen || 
      element.mozRequestFullscreen || 
      element.mozRequestFullScreen || 
      element.webkitRequestFullscreen;

  element.requestFullscreen();
}

function intersect(obj1,obj2,dis){
  var raycaster = new THREE.Raycaster();
  var rays = [
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(1, 0, 1),
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(1, 0, -1),
    new THREE.Vector3(0, 0, -1),
    new THREE.Vector3(-1, 0, -1),
    new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(-1, 0, 1)
  ];

  rays.forEach(function(vec){
    //raycaster.ray.direction.set(vec);
    //raycaster.ray.origin.copy( obj1.position );
    raycaster.ray.set(obj1.position,vec);
    var hit = raycaster.intersectObject(obj2);
    if(hit.length > 0 && hit[0].distance < dis){
      console.log(hit[0].distance);
    }
  });
}
