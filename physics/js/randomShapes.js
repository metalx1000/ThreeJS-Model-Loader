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
