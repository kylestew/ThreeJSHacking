var container = document.getElementById( 'container' );
var scene, camera, renderer;
var controls;

var points = [];

// run
init();
render();

function generateGeometry(radius) {
  var vertices = [
    1, 1, 1,
    -1, -1, 1,
    -1, 1, -1,
    1, -1, -1
  ];
  var indices = [
    2, 1, 0,
    0, 3, 2,
    1, 3, 0,
    2, 3, 1
  ];

  var geom = new THREE.Geometry();

  // create unitized vertices
  for (var i = 0, l = vertices.length; i < l; i += 3) {
    var vector = new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
    var vertex = vector.normalize().clone();
    vertex.index = geom.vertices.push(vertex) - 1;

    var u = azimuth(vector) / 2 / Math.PI + 0.5;
    var v = inclination(vector) / Math.PI + 0.5;
    vertex.uv = new THREE.Vector2(u, 1 - v);
  }

  // create faces
  for (var i = 0, j = 0, l = indices.length; i < l; i+= 3, j++) {
    var v1 = geom.vertices[indices[i]];
    var v2 = geom.vertices[indices[i+1]];
    var v3 = geom.vertices[indices[i+2]];
    geom.faces.push(new THREE.Face3(v1.index, v2.index, v3.index));
  }

  // apply radius
  for ( var i = 0, l = geom.vertices.length; i < l; i ++ ) {
    geom.vertices[ i ].multiplyScalar( radius );
  }


  function azimuth( vector ) {
		return Math.atan2( vector.z, - vector.x );
	}
  function inclination( vector ) {
		return Math.atan2( - vector.y, Math.sqrt( ( vector.x * vector.x ) + ( vector.z * vector.z ) ) );
	}

  geom.computeFaceNormals();

  geom = new THREE.TetrahedronGeometry( 1 );
  return geom;
}


function dumpGeometryToPoints(geometry) {
  points = points.concat(geometry.vertices);
}

function init() {
  scene = new THREE.Scene();
  scene.add( new THREE.GridHelper( 100, 1 ) );
  scene.add( new THREE.AxisHelper( 5 ) );
  // scene.fog = new THREE.Fog( 0x808080, 2000, 4000 );

  // lights
  scene.add( new THREE.AmbientLight( 0x222266 ) );
  var light1 = new THREE.DirectionalLight( 0xff0000, 0.8 );
  light1.position.set( -4, 10, -8 );
  scene.add( light1 );
  var light2 = new THREE.SpotLight( 0xff0000, 0.3 );
  light2.position.set( 0, 0, 100 );
  scene.add( light2 );

  // camera
  camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1, 4000);
  camera.position.z = 5;
  camera.position.x = 5;
  camera.position.y = 5;

  // base geometry
  var mat = new THREE.MeshLambertMaterial({color: 0xFFFFFF});
  mat.shading = THREE.FlatShading;
  mat.side = THREE.DoubleSide;
  var radius = 1.4;
  var geom = generateGeometry(radius);
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
    size: 0.2
  });
  particleSystem = new THREE.PointCloud(particles, material);
  scene.add(particleSystem);


  // extras
  var transpMat = new THREE.MeshLambertMaterial({color: 0xFFFFFF});
  transpMat.wireframe = true;

  // CIRCUMSPHERE: all 4 vertices lie in surface
  // R = sqrt(3/8)a (where a = length of edge)
  var circumSphere = new THREE.SphereGeometry(radius, 12, 12);
  scene.add(new THREE.Mesh(circumSphere, transpMat));
  // TODO: circles/spheres


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
