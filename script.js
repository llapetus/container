import * as THREE from 'three';
import { XRButton } from 'three/examples/jsm/webxr/XRButton.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let camera, scene, renderer;
const cubes = []; // Store cubes
const gridSize = 10;
const spacing = 0.6;
const radius = 2;
const clock = new THREE.Clock();
let angle = 0;

init();
animate();

document.addEventListener('mousemove', handleMouseMove);
window.addEventListener('resize', onWindowResize);



function init() {
  const container = document.createElement('div');
  document.body.appendChild(container);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 10);
  camera.position.set(0, 1, 10);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  container.appendChild(renderer.domElement);
  document.body.appendChild(XRButton.createButton(renderer));

  const light = new THREE.HemisphereLight(0xffffff, 0x444444);
  light.position.set(0, 2, 0);
  scene.add(light);

  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1); // Correct definition
  const mesh = new THREE.Mesh(boxGeometry, material);
  scene.add(mesh);

  const vertices = [];

  for (let i = 0; i < 10000; i++) {
    vertices.push(THREE.MathUtils.randFloatSpread(2000)); // x
    vertices.push(THREE.MathUtils.randFloatSpread(2000)); // y
    vertices.push(THREE.MathUtils.randFloatSpread(2000)); // z
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

  const particles = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0x888888 }));
  scene.add(particles);

  loadModel();
  createGrid();
}

function handleMouseMove(event) {
  const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  camera.rotation.y = mouseX * Math.PI * 0.5;
  camera.rotation.x = mouseY * Math.PI * 0.5;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function loadModel() {
  const loader = new GLTFLoader();
  loader.load('./models/scene.gltf', (gltf) => {
    gltf.scene.scale.set(0.5, 0.5, 0.5);
    scene.add(gltf.scene);
  }, undefined, (error) => {
    console.error('Error loading model:', error);
  });
}

function createGrid() {
  const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(
        (i - gridSize / 2) * spacing,
        Math.random() * 2, // Random height
        (j - gridSize / 2) * spacing
      );
      scene.add(cube);
      cubes.push(cube);
    }
  }
}

function animate() {
  renderer.setAnimationLoop(render);
}

function render() {
  const delta = clock.getDelta();
  const time = clock.getElapsedTime();

  angle += delta * 1.5;
  camera.position.x = Math.cos(angle) * radius;
  camera.position.z = Math.sin(angle) * radius;
  camera.lookAt(0, 0, 0);

  // Apply transformations (wave effect)
  cubes.forEach((cube) => {
    const { x, z } = cube.position;
    cube.position.y = Math.sin(time + x + z) * 1.5;
    cube.rotation.y += 0.01;
  });

  renderer.render(scene, camera);
}