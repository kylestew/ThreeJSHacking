var container = document.getElementById( 'container' );
var scene, camera, renderer;
var controls;

var points = [];

// run
init();
render();

function createGeometry() {
  var geom = new THREE.Geometry();
  geom.vertices.push(new THREE.Vector3(0, 0, 0));
  geom.vertices.push(new THREE.Vector3(0, 1, 0));
  geom.vertices.push(new THREE.Vector3(1, 1, 0));
  geom.faces.push(new THREE.Face3(0,2,1));
  return geom;
}

function dumpGeometryToPoints(geometry) {
  points = points.concat(geometry.vertices);
}

function init() {
  scene = new THREE.Scene();
  scene.add( new THREE.GridHelper( 100, 1 ) );
  scene.fog = new THREE.Fog( 0x808080, 2000, 4000 );

  // lights
  scene.add( new THREE.AmbientLight( 0x444444 ) );
  var light1 = new THREE.DirectionalLight( 0xffffff, 0.5 );
  light1.position.set( 1, 1, 1 );
  scene.add( light1 );
  var light2 = new THREE.DirectionalLight( 0xffffff, 1.5 );
  light2.position.set( 0, -1, 0 );
  scene.add( light2 );

  // camera
  camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1, 4000);
  camera.position.z = 5;
  camera.position.x = 5;
  camera.position.y = 5;

  // geometry
  var mat = new THREE.MeshLambertMaterial({color:0xffff00});
  mat.side = THREE.DoubleSide;
  var geom = createGeometry();
  dumpGeometryToPoints(geom);
  var mesh = new THREE.Mesh(geom, mat);
  scene.add(mesh);

  // turn all vertices in scene into particles
  var particles = new THREE.BufferGeometry();
  var positions = new Float32Array(points.length * 3);
  _.each(points, function(p, i) {
    positions[i*3] = p.x;
    positions[i*3+1] = p.y;
    positions[i*3+2] = p.z;
  });
  particles.addAttribute('position', new THREE.BufferAttribute(positions, 3));
  particles.computeBoundingSphere();
  var material = new THREE.PointCloudMaterial({
    color: 0xFF0000,
    size: 0.3
  });
  particleSystem = new THREE.PointCloud(particles, material);
  scene.add(particleSystem);

  // orbit controls
  controls = new THREE.OrbitControls(camera, container);
  controls.damping = 0.2;
  controls.addEventListener('change', render);

  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.gammaInput = true;
  renderer.gammaOutput = true;
  container.appendChild(renderer.domElement);

  prepareGui();

  window.addEventListener( 'resize', onWindowResize, false );
}

function prepareGui() {
  var gui = new dat.GUI();
  // gui.add(params, 'flatShading').name('Flat Shading').onFinishChange(function(newValue) {
    // resetGeometry();
  // });
  // gui.add(params, 'widthSegments', 1, 64).name('Width Segments').onChange(function(newValue) {
  //   resetGeometry();
  // });
  // gui.add(params, 'heightSegments', 1, 64).name('Height Segments').onChange(function(newValue) {
  //   resetGeometry();
  // });
  gui.open();
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function render() {
  renderer.render(scene, camera);
}
