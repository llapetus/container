import * as THREE from 'three';
import { XRButton } from 'three/examples/jsm/webxr/XRButton.js';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'; // Uncomment if needed

let camera, scene, renderer;
const cubes = []; // Store cubes for grid
const gridSize = 10;
const spacing = 0.6;
const radius = 2;
let angle = 0;
const clock = new THREE.Clock();

// Data for a reactive rectangle drawn with p5.js
let reactiveRect = {
  x: 50,
  y: 50,
  w: 100,
  h: 50,
  color: 255 // white initially
};

function initThree() {
  scene = new THREE.Scene();

  // Use p5's windowWidth/windowHeight for Three.js camera aspect & renderer size
  camera = new THREE.PerspectiveCamera(70, windowWidth / windowHeight, 0.1, 10);
  camera.position.set(0, 1, 10);

  // Create a Three.js renderer; enable transparency so p5's canvas can show through if needed
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
  // Create a p5 canvas (this serves as the UI/background layer).
  createCanvas(windowWidth, windowHeight);
  background(0); // Set initial p5 background to black.
  initThree();  // Initialize the Three.js scene.
}

function draw() {
  // Draw a p5 background.
  background(200);

  // Update Three.js scene elements.
  updateScene();
  // Render the Three.js scene.
  renderer.render(scene, camera);

  // Draw the reactive rectangle on top of the p5 canvas.
  fill(reactiveRect.color);
  rect(reactiveRect.x, reactiveRect.y, reactiveRect.w, reactiveRect.h);
}

function mouseClicked() {
  // Check if the mouse click is inside the rectangle.
  if (
    mouseX > reactiveRect.x &&
    mouseX < reactiveRect.x + reactiveRect.w &&
    mouseY > reactiveRect.y &&
    mouseY < reactiveRect.y + reactiveRect.h
  ) {
    // Toggle the rectangle's color.
    if (reactiveRect.color === 255) {
      reactiveRect.color = color(0, 255, 0); // Change to green.
    } else {
      reactiveRect.color = 255; // Change back to white.
    }
  }
}

function mouseMoved() {
  // Optionally update the camera's rotation based on mouse movement.
  const mouseXNorm = (mouseX / windowWidth) * 2 - 1;
  const mouseYNorm = -(mouseY / windowHeight) * 2 + 1;
  camera.rotation.y = mouseXNorm * Math.PI * 0.5;
  camera.rotation.x = mouseYNorm * Math.PI * 0.5;
}

function windowResized() {
  // Adjust both the p5 canvas and the Three.js renderer when the window is resized.
  resizeCanvas(windowWidth, windowHeight);
  camera.aspect = windowWidth / windowHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(windowWidth, windowHeight);
}
