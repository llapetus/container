import * as THREE from 'three';
import { XRButton } from 'three/examples/jsm/webxr/XRButton.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let camera, scene, renderer;
const cubes = [];  // Store cubes
const gridSize = 10;
const spacing = 0.6;
let cube = [];
let angle = 0;
const radius = 2;

const clock = new THREE.Clock();

init();
animate();
function loadModel(scene) {
  const loader = new GLTFLoader();
  
  loader.load('./models/scene.gltf', function (gltf) {
    // Scale down the model
    gltf.scene.scale.set(0.5, 0.5, 0.5); // Adjust values as needed

    scene.add(gltf.scene); // Add the model to the scene
  }, undefined, function (error) {
    console.error('Error loading model:', error);
  });
}

function init() {
  const container = document.createElement('div');
  document.body.appendChild(container);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 10);
  camera.position.set(0, 1, 10); 

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  container.appendChild(renderer.domElement);

  document.body.appendChild(XRButton.createButton(renderer));

  const light = new THREE.HemisphereLight(0xffffff, 0x444444);
  light.position.set(0, 2, 0);
  scene.add(light);
  loadModel(scene);
  createGrid(); // Create cubes
}

function createGrid() {
  const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const cube = new THREE.Mesh(geometry, material);

      cube.position.set(
        (i - gridSize / 2) * spacing,
        Math.random() * 2,  // Random height
        (j - gridSize / 2) * spacing
      );

      scene.add(cube);
      cubes.push(cube); // Store cube in the array
    }
  }
}

function animate() {
  renderer.setAnimationLoop(render);
}

function render() {
  const delta = clock.getDelta(); 
    const time = clock.getElapsedTime(); // Get elapsed time
  
  angle += delta * 1.5; 
  camera.position.x = Math.cos(angle) * radius;
  camera.position.z = Math.sin(angle) * radius;
  camera.lookAt(0, 0, 0);

   // Apply transformations (wave effect)
  cubes.forEach((cube, index) => {
    const x = cube.position.x;
    const z = cube.position.z;
    cube.position.y = Math.sin(time + x + z) * 1.5; // Wave motion
    cube.rotation.y += 0.01; // Rotate
  });
  
  renderer.render(scene, camera);
}
