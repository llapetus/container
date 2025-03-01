import * as THREE from 'https://cdn.jsdelivr.net/npm/three@latest/build/three.module.js';
import { XRButton } from 'https://cdn.jsdelivr.net/npm/three@latest/examples/jsm/webxr/XRButton.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@latest/examples/jsm/loaders/GLTFLoader.js';

let camera, scene, renderer;
let cube;
let angle = 0;
const radius = 2;

init();
animate();

function loadModel(scene) {
    const loader = new GLTFLoader();
    
   loader.load('/models/scene.gltf', function (gltf) {
    scene.add(gltf.scene);
}, undefined, function (error) {
    console.error(error);
});

}

function init() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 10);
    camera.position.set(0, 1, 3); 

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    document.body.appendChild(XRButton.createButton(renderer));

    const light = new THREE.HemisphereLight(0xffffff, 0x444444);
    light.position.set(0, 2, 0);
    scene.add(light);

    const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    loadModel(scene);
}

function animate() {
    renderer.setAnimationLoop(render);
}

function render() {
    angle += 0.01;
    camera.position.x = Math.cos(angle) * radius;
    camera.position.z = Math.sin(angle) * radius;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
}
