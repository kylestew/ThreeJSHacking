var container = document.getElementById( 'container' );
var scene, camera, renderer;
var mesh;
var controls;

var params = {
  flatShading: true,
  radius: 1,
  widthSegments: 12,
  heightSegments: 12,
  xPos: 0,
  yPos: 0,
  zPos: 0,
  xRot: 0,
  yRot: 0
};

init();
render();

function init() {
  scene = new THREE.Scene();
  scene.add( new THREE.GridHelper( 100, 1 ) );
  scene.fog = new THREE.Fog( 0x808080, 2000, 4000 );

  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  // lighting
	light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 1, 1, 1 );
	scene.add( light );

	light = new THREE.DirectionalLight( 0x002288 );
	light.position.set( -1, -1, -1 );
	scene.add( light );

	light = new THREE.AmbientLight( 0x222222 );
	scene.add( light );

  // render object
  resetGeometry();
  scene.add(mesh);

  // orbit controls
  controls = new THREE.OrbitControls(camera);
  controls.damping = 0.2;
  controls.addEventListener('change', render);

  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setClearColor(0x22222233);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  prepareGui();
  prepareInput();

  window.addEventListener( 'resize', onWindowResize, false );
}

function prepareInput() {
  window.addEventListener('keydown', function(event) {
    switch(event.keyCode) {
      case 87: // W
        params.zPos -= 0.1;
        break;
      case 65: // A
        params.xPos -= 0.1;
        break;
      case 83: // S
        params.zPos += 0.1;
        break;
      case 68: // D
        params.xPos += 0.1;
        break;
      case 81: // Q
        params.xRot -= 0.1;
        break;
      case 69: // E
        params.xRot += 0.1;
        break;
      case 90: // Z
        params.yRot -= 0.1;
        break;
      case 67: // C
        params.yRot += 0.1;
        break;
    }
    resetGeometry();
  });
}

function prepareGui() {
  var gui = new dat.GUI();
  gui.add(params, 'flatShading').name('Flat Shading').onFinishChange(function(newValue) {
    resetGeometry();
  });
  gui.add(params, 'widthSegments', 1, 64).name('Width Segments').onChange(function(newValue) {
    resetGeometry();
  });
  gui.add(params, 'heightSegments', 1, 64).name('Height Segments').onChange(function(newValue) {
    resetGeometry();
  });
  gui.open();
}

function resetGeometry() {
  var geometry = new THREE.SphereGeometry(params.radius, params.widthSegments, params.heightSegments);
  var material = new THREE.MeshLambertMaterial( { color:0xffffff, shading: params.flatShading ? THREE.FlatShading : THREE.SmoothShading } );
  if (mesh) {
    mesh.material = material;
    mesh.geometry = geometry;
    mesh.position.x = params.xPos;
    mesh.position.y = params.yPos;
    mesh.position.z = params.zPos;
    mesh.rotation.x = params.xRot;
    mesh.rotation.y = params.yRot;
    render();
  } else {
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = params.xPos;
    mesh.position.y = params.yPos;
    mesh.position.z = params.zPos;
    mesh.rotation.x = params.xRot;
    mesh.rotation.y = params.yRot;
  }
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
	render();
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
}

function render() {
  renderer.render(scene, camera);
}
