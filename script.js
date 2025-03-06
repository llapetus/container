import * as THREE from 'three';
import { XRButton } from 'three/examples/jsm/webxr/XRButton.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let camera, scene, renderer;
const cubes = []; // Store cubes for grid
const gridSize = 10;
const spacing = 0.6;
const radius = 2;
let angle = 0;
const clock = new THREE.Clock();

function initThree() {
  scene = new THREE.Scene();

  // Use p5's width/height for Three.js camera aspect & renderer size
  camera = new THREE.PerspectiveCamera(70, windowWidth / windowHeight, 0.1, 10);
  camera.position.set(0, 1, 10);

  // Create a Three.js renderer; we allow transparency so p5.js background can show if desired
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(windowWidth, windowHeight);
  renderer.xr.enabled = true;
  // Append the Three.js canvas to the document.
  document.body.appendChild(renderer.domElement);
  document.body.appendChild(XRButton.createButton(renderer));

  // Add light to the scene.
  const light = new THREE.HemisphereLight(0xffffff, 0x444444);
  light.position.set(0, 2, 0);
  scene.add(light);

  // Add a static cube to the scene.
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  const mesh = new THREE.Mesh(boxGeometry, material);
  scene.add(mesh);

  // Create a particle system.
  const particlesGeometry = new THREE.BufferGeometry();
  const vertices = [];
  for (let i = 0; i < 10000; i++) {
    vertices.push(THREE.MathUtils.randFloatSpread(2000)); // x
    vertices.push(THREE.MathUtils.randFloatSpread(2000)); // y
    vertices.push(THREE.MathUtils.randFloatSpread(2000)); // z
  }
  particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  const particles = new THREE.Points(
    particlesGeometry,
    new THREE.PointsMaterial({ color: 0x888888 })
  );
  scene.add(particles);

  // Create a grid of cubes.
  createGrid();
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

function updateScene() {
  const delta = clock.getDelta();
  const time = clock.getElapsedTime();

  // Update camera position to move in a circle around the origin.
  angle += delta * 1.5;
  camera.position.x = Math.cos(angle) * radius;
  camera.position.z = Math.sin(angle) * radius;
  camera.lookAt(0, 0, 0);

  // Apply wave effect and rotation to grid cubes.
  cubes.forEach((cube) => {
    const { x, z } = cube.position;
    cube.position.y = Math.sin(time + x + z) * 1.5;
    cube.rotation.y += 0.01;
  });
}

// === p5.js functions ===

function setup() {
  // Create a p5 canvas (this can serve as your UI/background layer).
  createCanvas(windowWidth, windowHeight);
  // Initialize Three.js (it creates its own canvas which is appended to the document).
  initThree();
}

function draw() {
  // Optional: draw a p5 background (this draws on the p5 canvas, which is separate from the Three.js canvas).
  background(200);

  // Update Three.js scene elements.
  updateScene();

  // Render the Three.js scene.
  renderer.render(scene, camera);
}

// Instead of document.addEventListener('mousemove', ...), use p5's mouseMoved.
function mouseMoved() {
  const mouseXNorm = (mouseX / windowWidth) * 2 - 1;
  const mouseYNorm = -(mouseY / windowHeight) * 2 + 1;
  camera.rotation.y = mouseXNorm * Math.PI * 0.5;
  camera.rotation.x = mouseYNorm * Math.PI * 0.5;
}

// Use p5's windowResized instead of window.addEventListener.
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  camera.aspect = windowWidth / windowHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(windowWidth, windowHeight);
}
