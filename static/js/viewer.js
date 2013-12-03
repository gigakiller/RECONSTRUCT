// set the scene size
var WIDTH = 940, HEIGHT = 500;

// global variables
var viewer, camera, scene, renderer, ambient, controls, particles;

// set some camera attributes
var VIEW_ANGLE = 70, ASPECT = WIDTH / HEIGHT,
	NEAR = 0.0001, FAR = 10000;

// set size of the particles
var particleSize = 0.004;

function onLoad() {
	initScene();
	animate();
}

function initScene() {
	viewer = document.getElementById('viewer');
	if (viewer !== null) {
		renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.setSize( WIDTH, HEIGHT );
		viewer.appendChild( renderer.domElement );
	}

	// this is the scene all objects will be added to
	scene = new THREE.Scene();
	// ambient light
	ambient = new THREE.AmbientLight( 0x990099 ); //0x999999 );
	scene.add( ambient );

	camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
	camera.position.z = 2;
	scene.add( camera );

	// set the camera's behaviour and sensitivity
	controls = new THREE.TrackballControls( camera );
	controls.rotateSpeed = 5.0;
	controls.zoomSpeed = 3;
	controls.panSpeed = 2;
	controls.noZoom = false;
	controls.noPan = false;
	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;
}

// the loop
function animate() {
	// this function calls itself on every frame
	requestAnimationFrame( animate );

	// on every frame, calculate the new camera position and have it look at the center of the scene
	controls.update();
	// camera.lookAt(scene.position);
	renderer.render(scene, camera);
}

function loadCloud(data) {
	model = new THREE.Geometry();
	model.dynamic = true;

	// points are stored in a giant string, with 1 point on each line: x y z r g b, separated by whitespace
	var cloud = data.split('\n');
	var colours = [];

	// initialize min and max coords
    min_x = 0;
    min_y = 0;
    min_z = 0;
    max_x = 0;
    max_y = 0;
    max_z = 0;

	// load the points
	for (var i=0; i<cloud.length; i++) {
		var pt = cloud[i].split(" ");
		var x = parseFloat(pt[0]);
		var y = parseFloat(pt[1]);
		var z = parseFloat(pt[2]);

        if (x < min_x) {min_x = x;}
        if (x > max_x) {max_x = x;}
        if (y < min_y) {min_y = y;}
        if (y > max_y) {max_y = y;}
        if (z < min_z) {min_z = z;}
        if (z > max_z) {max_z = z;}

		var colour = 'rgb(' + parseFloat(pt[3]) + ',' + parseFloat(pt[4]) + ',' + parseFloat(pt[5]) + ')';
		model.vertices.push( new THREE.Vector3(x, y, z) );
		colours.push( new THREE.Color(colour) );
	}
	model.colors = colours;

	// load model
	var material = new THREE.ParticleBasicMaterial({ size: particleSize, vertexColors: true });
	particles = new THREE.ParticleSystem(model, material);
	mid_x = ( min_x + max_x ) / 2;
	mid_y = ( min_y + max_y ) / 2;
	mid_z = ( min_z + max_z ) / 2;
	particles.geometry.applyMatrix( new THREE.Matrix4().makeTranslation(-mid_x, -mid_y, -mid_z) );
	scene.add(particles);
	controls.reset();
}

function clearScene() {
	if (scene.__webglObjects.length > 0) {
		scene.remove(particles);
	}
}
