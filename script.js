import 'https://cdn.jsdelivr.net/npm/p5@1.6.0/lib/p5.min.js';
import 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.1/addons/p5.sound.min.js';

import * as THREE from 'three';
import { XRButton } from 'three/examples/jsm/webxr/XRButton.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let camera, scene, renderer;

const cubes = []; // Store cubes
const gridSize = 10;
const spacing = 0.6;
const radius = 2;
const clock = new THREE.Clock();

let frameCount = 0;
const n = 100; // update every 10th frame


let mousePosX = 0;
let mousePosY = 0;

let angle = 0;

let angleX = 0;
let angleY = 0;
let audioLevel = 0;
let mic, amplitude;

let material;

// Define your sketch using the global p5 variable
const sketch = (p) => {
  p.setup = () => {
    p.noCanvas();
    // Create a new AudioIn instance and start it
    mic = new p5.AudioIn();
    mic.start();

    // Create an Amplitude analyzer and set its input to the microphone
    amplitude = new p5.Amplitude();
    amplitude.setInput(mic);

    init();
  };

  p.draw = () => {
    // Get the current volume level (a value between 0 and ~1)
    let vol = amplitude.getLevel();

    // Map the volume to a scale factor (for example, from 0.5 to 2 times)
    let scaleFactor = p.map(vol, 0, 1, 0.5, 2);
    animate();
  };



  // Define keyPressed correctly for instance mode
  p.keyPressed = () => {
    console.log("ahoj");
    if (p.key === 'd') {
      console.log("aaaaa");

      if (loadedModel) {
        // For example, move the model along the x-axis over time
        loadedModel.position.x += 1;

      }

    } else if (p.key === 'a') {
      console.log("ssssssss");
      if (loadedModel) {
        // For example, move the model along the x-axis over time
        loadedModel.position.x -= 1;

      }

    } else if (p.key === 's') {
      console.log("aaaa");
      if (loadedModel) {
        // For example, move the model along the x-axis over time
        loadedModel.position.y -= 1;

      }
    } else if (p.key === 'w') {
      console.log("dddd");

      if (loadedModel) {
        // For example, move the model along the x-axis over time
        loadedModel.position.y += 1;

      }
    }
  };
};

// Initialize the sketch (p5 is now available globally)
new p5(sketch);

function handleMouseMove(event) {

  const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  mousePosX = mouseX;
  mousePosY = mouseY;

  camera.rotation.y = -mouseX * Math.PI * 0.5;
  camera.rotation.x = mouseY * Math.PI * 0.5;
}

document.addEventListener('mousemove', handleMouseMove);
window.addEventListener('resize', onWindowResize);

function init() {
  const container = document.createElement('div');
  document.body.appendChild(container);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10);
  camera.position.set(0, 1, 100);

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

  const geometry = new THREE.BufferGeometry();
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

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
let loadedModel;

function loadModel() {
  const loader = new GLTFLoader();
  loader.load('./models/scene.gltf', (gltf) => {
    gltf.scene.scale.set(0.5, 0.5, 0.5);
    scene.add(gltf.scene);
    // Store the loaded model for later use
    loadedModel = gltf.scene;
  }, undefined, (error) => {
    console.error('Error loading model:', error);
  });
}

function createGrid() {
  const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(Math.random(), Math.random(), Math.random()) // Random RGB values between 0 and 1
  });


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


  frameCount++;
  renderer.setAnimationLoop(render);
}

let elapsedTime = 0;


function render() {
  const delta = clock.getDelta();
  const time = clock.getElapsedTime();

  angleX += delta * mousePosX;
  angleY += delta * mousePosY;
  camera.position.x = Math.cos(angleX) * radius;
  camera.position.z = Math.sin(angleX) * radius;
  

  elapsedTime +=  clock.getDelta();

  camera.lookAt(0, 0, 0);
  material.transparent = true;  // Enable transparency

  material.opacity = 0.5 * (Math.sin(elapsedTime) + 1) ;



  // Apply transformations (wave effect)
  cubes.forEach((cube) => {
    const { x, z } = cube.position;
    cube.position.y = Math.sin(time + x + z) * 1.5;
    cube.rotation.y += 0.01;
    // Check if the current frame is a multiple of n
    if (frameCount % n === 0) {
      // For example, move the cube along the x-axis every nth frame
      cube.scale.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
    }
    //cube.scale = Math.random()*10;}
  });

  renderer.render(scene, camera);
}
