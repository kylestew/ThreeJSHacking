var container = document.getElementById( 'container' );
var scene, camera, renderer;
var mesh;
var controls;

var params = {
  flatShading: true,
  radius: 1,
  widthSegments: 12,
  heightSegments: 12
};

init();
render();

function init() {
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xcccccc, 0.002);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.z = 5;
  // camera.target = new THREE.Vector3();

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
  var geometry = new THREE.SphereGeometry(params.radius, params.widthSegments, params.heightSegments);
  var material = new THREE.MeshLambertMaterial( { color:0xffffff, shading: THREE.FlatShading } );
  mesh = new THREE.Mesh(geometry, material);
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

  var gui = new dat.GUI();
  gui.add(params, 'flatShading').name('Flat Shading').onFinishChange(function(newValue) {
    if (true)
      mesh.material = new THREE.MeshLambertMaterial( { color:0xffffff, shading: THREE.FlatShading } );
    else
      mesh.material = new THREE.MeshLambertMaterial( { color:0xffffff } );
  });
  gui.add(params, 'widthSegments').name('Width Segments').onFinishChange(function(newValue) {
  });
  gui.open();

  window.addEventListener( 'resize', onWindowResize, false );
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
