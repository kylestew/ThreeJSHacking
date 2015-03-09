var container = document.getElementById( 'container' );
var scene, camera, renderer;
var controls;

var particleSystem;

var config = {
  maxParticles: 1024
};

// run
init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.add( new THREE.GridHelper( 10000, 100 ) );
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
  camera.position.z = 1750;

  // point cloud
  var particles = new THREE.Geometry();
  for (var i = 0; i < config.maxParticles; i++) {
    var pX = Math.random() * 500 - 250,
        pY = Math.random() * 500 - 250,
        pZ = Math.random() * 500 - 250;
    var particle = new THREE.Vector3(pX, pY, pZ)

    particles.vertices.push(particle);
  }
  var material = new THREE.ParticleBasicMaterial({
      color: 0xFFFFFF,
      size:2 
    });
  particleSystem = new THREE.ParticleSystem(particles, material);
  scene.add(particleSystem);

  // orbit controls
  controls = new THREE.OrbitControls(camera, container);
  controls.damping = 0.2;
  // controls.addEventListener('change', render);

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

function animate() {

  requestAnimationFrame(animate); // animation loop
  render();
}

function render() {
  var time = Date.now() * 0.001;
  // group.rotation.y = time * 0.01;
  renderer.render(scene, camera);
}
