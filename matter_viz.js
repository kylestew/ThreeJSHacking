var Visualizer = function() {

  var camera, scene, renderer;
  var manager;
  var texture;
  var model;

  var windowHalfX = window.innerWidth / 2;
  var windowHalfY = window.innerHeight / 2;

    var onProgress = function ( xhr ) {
            if ( xhr.lengthComputable ) {
              var percentComplete = xhr.loaded / xhr.total * 100;
              console.log( Math.round(percentComplete, 2) + '% downloaded' );
            }
    };
    var onError = function(xhr) {
      debugger;
    };

  this.reloadModel = function(modelName) {
    var loader = new THREE.OBJLoader(manager);
    loader.load('obj/' + modelName, function(object) {
      scene.remove(model);
      model = object;

      object.traverse( function ( child ) {
        if ( child instanceof THREE.Mesh ) {
          child.material.map = texture;
        }
      });

      scene.add(model);
    }, onProgress, onError);

  }

  var drawBg = function() {
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    var r, g, b, a;
    var val = audioSource.volume/1000;
    r = 200 + (Math.sin(val) + 1) * 28;
    g = val * 2;
    b = val * 8;
    a = Math.sin(val+3*Math.PI/2) + 1;
    bgCtx.beginPath();
    bgCtx.rect(0, 0, bgCanvas.width, bgCanvas.height);
    // create radial gradient
    var grd = bgCtx.createRadialGradient(bgCanvas.width/2, bgCanvas.height/2, val, bgCanvas.width/2, bgCanvas.height/2, bgCanvas.width-Math.min(Math.pow(val, 2.2), bgCanvas.width - 20));
    grd.addColorStop(0, 'rgba(0,0,0,0)');// centre is transparent black
    grd.addColorStop(0.8, "rgba(" +
        Math.round(r) + ", " +
        Math.round(g) + ", " +
        Math.round(b) + ", 0.4)"); // edges are reddish

    bgCtx.fillStyle = grd;
    bgCtx.fill();
    /*
     // debug data
     bgCtx.font = "bold 30px sans-serif";
     bgCtx.fillStyle = 'grey';
     bgCtx.fillText("val: " + val, 30, 30);
     bgCtx.fillText("r: " + r , 30, 60);
     bgCtx.fillText("g: " + g , 30, 90);
     bgCtx.fillText("b: " + b , 30, 120);
     bgCtx.fillText("a: " + a , 30, 150);*/
};

function Star(x, y, starSize, ctx) {
       this.x = x;
       this.y = y;
       this.angle = Math.atan(Math.abs(y)/Math.abs(x));
       this.starSize = starSize;
       this.ctx = ctx;
       this.high = 0;
   }
   Star.prototype.drawStar = function() {
       var distanceFromCentre = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));

       // stars as lines
       var brightness = 200 + Math.min(Math.round(this.high * 5), 55);
       this.ctx.lineWidth= 0.5 + distanceFromCentre/2000 * Math.max(this.starSize/2, 1);
       this.ctx.strokeStyle='rgba(' + brightness + ', ' + brightness + ', ' + brightness + ', 1)';
       this.ctx.beginPath();
       this.ctx.moveTo(this.x,this.y);
       var lengthFactor = 1 + Math.min(Math.pow(distanceFromCentre,2)/30000 * Math.pow(audioSource.volume, 2)/6000000, distanceFromCentre);
       var toX = Math.cos(this.angle) * -lengthFactor;
       var toY = Math.sin(this.angle) * -lengthFactor;
       toX *= this.x > 0 ? 1 : -1;
       toY *= this.y > 0 ? 1 : -1;
       this.ctx.lineTo(this.x + toX, this.y + toY);
       this.ctx.stroke();
       this.ctx.closePath();

       // starfield movement coming towards the camera
       var speed = lengthFactor/20 * this.starSize;
       this.high -= Math.max(this.high - 0.0001, 0);
       if (speed > this.high) {
           this.high = speed;
       }
       var dX = Math.cos(this.angle) * this.high;
       var dY = Math.sin(this.angle) * this.high;
       this.x += this.x > 0 ? dX : -dX;
       this.y += this.y > 0 ? dY : -dY;

       var limitY = fgCanvas.height/2 + 500;
       var limitX = fgCanvas.width/2 + 500;
       if ((this.y > limitY || this.y < -limitY) || (this.x > limitX || this.x < -limitX)) {
           // it has gone off the edge so respawn it somewhere near the middle.
           this.x = (Math.random() - 0.5) * fgCanvas.width/3;
           this.y = (Math.random() - 0.5) * fgCanvas.height/3;
           this.angle = Math.atan(Math.abs(this.y)/Math.abs(this.x));
       }
   };

   var makeStarArray = function() {
       var x, y, starSize;
       stars = [];
       var limit = fgCanvas.width / 15; // how many stars?
       for (var i = 0; i < limit; i ++) {
           x = (Math.random() - 0.5) * fgCanvas.width;
           y = (Math.random() - 0.5) * fgCanvas.height;
           starSize = (Math.random()+0.1)*3;
           stars.push(new Star(x, y, starSize, sfCtx));
       }
   };
   var draw = function() {
    fgCtx.clearRect(-fgCanvas.width, -fgCanvas.height, fgCanvas.width*2, fgCanvas.height *2);
    sfCtx.clearRect(-fgCanvas.width/2, -fgCanvas.height/2, fgCanvas.width, fgCanvas.height);

    stars.forEach(function(star) {
        star.drawStar();
    });
    // tiles.forEach(function(tile) {
    //     tile.drawPolygon();
    // });
    // tiles.forEach(function(tile) {
    //     if (tile.highlight > 0) {
    //         tile.drawHighlight();
    //     }
    // });

    // debug
    /* fgCtx.font = "bold 24px sans-serif";
     fgCtx.fillStyle = 'grey';
     fgCtx.fillText("minMental:" + minMental, 10, 10);
     fgCtx.fillText("maxMental:" + maxMental, 10, 40);*/
    requestAnimationFrame(draw);
};

this.resizeCanvas = function() {
    if (fgCanvas) {
        // resize the foreground canvas
        fgCanvas.width = window.innerWidth;
        fgCanvas.height = window.innerHeight;
        fgCtx.translate(fgCanvas.width/2,fgCanvas.height/2);

        // resize the bg canvas
        bgCanvas.width = window.innerWidth;
        bgCanvas.height = window.innerHeight;
        // resize the starfield canvas
        sfCanvas.width = window.innerWidth;
        sfCanvas.height = window.innerHeight;
        sfCtx.translate(fgCanvas.width/2,fgCanvas.height/2);

        tileSize = fgCanvas.width > fgCanvas.height ? fgCanvas.width / 25 : fgCanvas.height / 25;

        drawBg();
        // makePolygonArray();
        makeStarArray()
    }
};


var fgCanvas;
   var fgCtx;
var stars = [];
  var bgCanvas, bgCtx;
  var sfCanvas;
    var sfCtx;

  this.init = function(options) {
    audioSource = options.audioSource;
    var container = document.getElementById(options.containerId);

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    scene = new THREE.Scene();

    // lighting
    var ambient = new THREE.AmbientLight(0x101030);
    scene.add(ambient);

    var directionalLight = new THREE.DirectionalLight( 0xffeedd );
    directionalLight.position.set( 0, 0, 1 );
    scene.add( directionalLight );

    // loader methods
    manager = new THREE.LoadingManager();
    manager.onProgress = function ( item, loaded, total ) {
      console.log( item, loaded, total );
    };

    // texture
    texture = new THREE.Texture();
    var loader = new THREE.ImageLoader( manager );
    loader.load( 'textures/UV_Grid_Sm.jpg', function ( image ) {
      texture.image = image;
      texture.needsUpdate = true;
    });

    // model
    var loader = new THREE.OBJLoader(manager);
    loader.load('obj/cube.obj', function(object) {
      model = object;

      object.traverse( function ( child ) {
        if ( child instanceof THREE.Mesh ) {
          child.material.map = texture;
        }
      });

      scene.add(model);
    }, onProgress, onError);

    // renderer
    renderer = new THREE.WebGLRenderer({alpha: true});
    // renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.domElement.setAttribute('style', 'position: absolute; z-index: 20');
    container.appendChild( renderer.domElement );


    window.addEventListener( 'resize', onWindowResize, false );
    window.addEventListener( 'resize', this.resizeCanvas, false );
      // draw();

    setInterval(drawBg, 100);
    setInterval(draw, 2000);

    // foreground
    fgCanvas = document.createElement('canvas');
    fgCanvas.setAttribute('style', 'position: absolute; z-index: 10');
    fgCtx = fgCanvas.getContext("2d");
    container.appendChild(fgCanvas);
    // middle starfield layer
    sfCanvas = document.createElement('canvas');
    sfCtx = sfCanvas.getContext("2d");
    sfCanvas.setAttribute('style', 'position: absolute; z-index: 5');
    container.appendChild(sfCanvas);
    // background image layer
    bgCanvas = document.createElement('canvas');
    bgCtx = bgCanvas.getContext("2d");
    container.appendChild(bgCanvas);
    makeStarArray();
    this.resizeCanvas();

    // go!
    animate();
  };

  function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
  }

  function animate() {
    setTimeout( function() {
  		requestAnimationFrame( animate );
      update();
  		render();
    }, 1000 / 30 );
	}

  function render() {
    // camera.position.x += ( mouseX - camera.position.x ) * .05;
    // camera.position.y += ( - mouseY - camera.position.y ) * .05;
    camera.lookAt( scene.position );
    renderer.render( scene, camera );
  }










  //====================================================
  //====================================================
  //====================================================
  // CUSTOMIZE HERE: ABOVE IS A FUCKING MESS!!!
  var fgRotation = -0.6;

  function update() {
    if (!model)
      return;

    var rotation = fgRotation;
    rotation += audioSource.volume > 10000 ? Math.sin(audioSource.volume/5500) : 0;
    // console.log(rotation);

    // console.log(audioSource.volume);
    // console.log(audioSource.streamData.length);

    // process sound here
    model.rotation.x = rotation;
    model.rotation.y = rotation;

    // model.scale.x = 1.0 + rotation;
  }
};
