    var container;

    var camera, scene, renderer, effect;
    var spheres = [];

    var directionalLight, pointLight;

    var mouseX = 0, mouseY = 0;

    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;

    init();
    animate();

    function init() {
      container = document.createElement('div');
      document.body.appendChild(container);

      camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 100000);
      camera.position.z = 3200;

      // scene
      scene = new THREE.Scene();

      var geometry = new THREE.SphereGeometry(100, 32, 16);

      var path = "textures/cube/pisa/";
      var format = '.png';
      var urls = [
        path + 'px' + format, path + 'nx' + format,
        path + 'py' + format, path + 'ny' + format,
        path + 'pz' + format, path + 'nz' + format
      ];
      var textureCube = THREE.ImageUtils.loadTextureCube( urls );
      var material = new THREE.MeshBasicMaterial( { color: 0xffffff, envMap: textureCube } );

      // all those spehers!?
      for ( var i = 0; i < 500; i ++ ) {
        var mesh = new THREE.Mesh( geometry, material );

        mesh.position.x = Math.random() * 10000 - 5000;
        mesh.position.y = Math.random() * 10000 - 5000;
        mesh.position.z = Math.random() * 10000 - 5000;

        mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 3 + 1;

        scene.add( mesh );

        spheres.push( mesh );
      }

      // Skybox
    	var shader = THREE.ShaderLib[ "cube" ];
    	shader.uniforms[ "tCube" ].value = textureCube;

  		var material = new THREE.ShaderMaterial( {

  			fragmentShader: shader.fragmentShader,
  			vertexShader: shader.vertexShader,
  			uniforms: shader.uniforms,
  			side: THREE.BackSide

  		} ),
  		mesh = new THREE.Mesh( new THREE.BoxGeometry( 100000, 100000, 100000 ), material );
  		scene.add( mesh );


      // var ambient = new THREE.AmbientLight(0x101030);
      // scene.add(ambient);
      //
      // var directionalLight = new THREE.DirectionalLight(0xffeedd);
      // directionalLight.position.set(0, 0, 10);
      // scene.add(directionalLight);

      // loader methods
      var onProgress = function ( xhr ) {
              if ( xhr.lengthComputable ) {
                var percentComplete = xhr.loaded / xhr.total * 100;
                console.log( Math.round(percentComplete, 2) + '% downloaded' );
              }
      };
      var onError = function(xhr) {
        debugger;
      };
      var manager = new THREE.LoadingManager();
      manager.onProgress = function ( item, loaded, total ) {
        console.log( item, loaded, total );
      };

      // texture
      var texture = new THREE.Texture();
      var loader = new THREE.ImageLoader( manager );
        loader.load( 'textures/UV_Grid_Sm.jpg', function ( image ) {

        texture.image = image;
        texture.needsUpdate = true;
      });

      // model
      var loader = new THREE.OBJLoader(manager);
      loader.load('obj/cube.obj', function(object) {
        // object.traverse( function ( child ) {
          // if ( child instanceof THREE.Mesh ) {
            // child.material.map = material;
          // }
        // });

  // object.scale = new THREE.Vector3(10, 10, 10);
        // object.position.y = -80;
        scene.add(object);
      }, onProgress, onError);

      renderer = new THREE.WebGLRenderer();
      renderer.setPixelRatio( window.devicePixelRatio );
    //   renderer.setSize( window.innerWidth, window.innerHeight );
      container.appendChild( renderer.domElement );

      var width = window.innerWidth || 2;
      var height = window.innerHeight || 2;

      effect = new THREE.AnaglyphEffect( renderer );
      effect.setSize( width, height );

      document.addEventListener( 'mousemove', onDocumentMouseMove, false );
      window.addEventListener( 'resize', onWindowResize, false );
    }

    function onWindowResize() {
      windowHalfX = window.innerWidth / 2;
      windowHalfY = window.innerHeight / 2;

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      effect.setSize( window.innerWidth, window.innerHeight );
    }

    function onDocumentMouseMove( event ) {
      mouseX = ( event.clientX - windowHalfX ) * 10;
      mouseY = ( event.clientY - windowHalfY ) * 10;
    }

    function animate() {
      requestAnimationFrame( animate );
      render();
    }

    function render() {
      camera.position.x += ( mouseX - camera.position.x ) * .05;
      camera.position.y += ( - mouseY - camera.position.y ) * .05;

      camera.lookAt( scene.position );

      effect.render( scene, camera );
    }
