var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000,
);

var renderer = new THREE.WebGLRenderer({
	depth: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.AmbientLight();
light.position.set(2.5, 7.5, 15);
scene.add(light);

camera.position.z = 5;

let geometry;
let group;

const createMaterial = path => {
	const loader = new THREE.TextureLoader().setPath(path);
	const material = new THREE.MeshStandardMaterial();
	material.map = loader.load('marshmallow_1001_BaseColor.jpg');
	material.metalnessMap = loader.load('marshmallow_1001_Metallic.jpg');
	material.roughnessMap = loader.load('marshmallow_1001_Roughness.jpg');
	material.bumpMap = loader.load('marshmallow_1001_Height.jpg');
	material.normalMap = loader.load('marshmallow_1001_Normal.jpg');
	material.emissiveMap = loader.load('marshmallow_1001_Emissive.jpg');
	material.transparent = true;
	material.clipIntersection = true;
	material.depthWrite = false;
	return material;
};

const createFire = () => {

}

const createModel = material =>
	new Promise(resolve => {
		const objLoader = new THREE.OBJLoader();
		objLoader.load(
			'https://d1spotbdoufgh0.cloudfront.net/marshmallow.obj',
			object => {
				model = object;
				object.children[0].material = material;
				object.children[0].geometry.computeBoundingSphere();
				geometry = object.children[0].geometry;
				object.position.x = 0;
				resolve(object);
			},
			xhr => {
				console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
			},
			error => {
				console.log(error);
			},
		);
	});

let outerModel;
const createScene = async () => {
	const warmMaterial = createMaterial(
		'https://d1spotbdoufgh0.cloudfront.net/warm/',
	);
	const burntMaterial = createMaterial(
		'https://d1spotbdoufgh0.cloudfront.net/burnt/',
	);
	outerModel = await createModel(warmMaterial);
	const innerModel = await createModel(burntMaterial);
	innerModel.scale.multiplyScalar(0.9);
	innerModel.renderOrder = 1;
	outerModel.renderOrder = 2;

	group = new THREE.Group();
	group.add(innerModel);
	group.add(outerModel);
	scene.add(group);
	onResize();
	animate();
};

var animate = function () {
	requestAnimationFrame(animate);
	if (outerModel) {
		outerModel.traverse(function (child) {
			if (child.isMesh) {
				child.material.opacity = 1 - (window.progress ?? 0) * 0.01;
			}
		});
		//outerModel.material.alpha += 1;
	}

	renderer.render(scene, camera);
};

const onResize = () => {
	const aspect = window.innerWidth / window.innerHeight;

	camera.aspect = aspect;

	camera.fov =
		2 *
		Math.atan((geometry.boundingSphere.radius * 2) / (2 * 5)) *
		(180 / Math.PI);

	renderer.setSize(window.innerWidth, window.innerHeight);
	// Don't forget this
	camera.updateProjectionMatrix();
};

window.addEventListener('resize', onResize, false);
window.addEventListener('orientationchange', onResize, false);

function deviceOrientationHandler(tiltX) {
	if (tiltX < 10 && tiltX > -10) {
		return;
	}
	requestAnimationFrame(() => {
		group.rotation.y += tiltX > 0 ? -0.01 : 0.01;
	});
}

createScene();
if (window.DeviceOrientationEvent) {
	if (typeof DeviceMotionEvent.requestPermission === 'function') {
		document.querySelector('.button').addEventListener('click', () => {
			createScene();
			document.querySelector('.button').style.display = 'none'

			DeviceMotionEvent.requestPermission()
				.then(response => {
					window.addEventListener(
						'deviceorientation',
						function (eventData) {
							var tiltX = Math.round(eventData.beta);
							deviceOrientationHandler(tiltX);
						},
						false,
					);
				})
				.catch(console.error);
		});
	} else {
		// ignore this case for processing
		console.log('non iOS 13');
		window.setInterval(() => {
			deviceOrientationHandler(100);
		}, 100)
	}
}
