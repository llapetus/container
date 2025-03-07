let camera, scene, renderer;
let cubes = [];
const gridSize = 10;
const spacing = 0.6;
const clock = new THREE.Clock();
let angle = 0;

function setup() {
  // Create a p5 canvas in WEBGL mode
  const cnv = createCanvas(windowWidth, windowHeight, WEBGL);

  // Create a three.js renderer using the p5 canvas element
  renderer = new THREE.WebGLRenderer({ antialias: true, canvas: cnv.elt });
  renderer.setSize(windowWidth, windowHeight);
  renderer.xr.enabled = true;  // Enable XR support

  // Append the XR button to allow entering VR mode
  document.body.appendChild(XRButton.createButton(renderer));

  // Create a three.js scene and perspective camera
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(70, windowWidth / windowHeight, 0.1, 1000);
  camera.position.set(0, 1, 10);

  // Add a basic light to the scene
  const light = new THREE.HemisphereLight(0xffffff, 0x444444);
  light.position.set(0, 2, 0);
  scene.add(light);

  // Add a basic cube to the scene
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(boxGeometry, material);
  scene.add(cube);

  // Create a grid of smaller cubes with random colors and random heights
  const cubeGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const cubeMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(Math.random(), Math.random(), Math.random())
      });
      const smallCube = new THREE.Mesh(cubeGeometry, cubeMaterial);
      smallCube.position.set(
        (i - gridSize / 2) * spacing,
        Math.random() * 2,
        (j - gridSize / 2) * spacing
      );
      scene.add(smallCube);
      cubes.push(smallCube);
    }
  }
}

function draw() {
  // Update animation timing
  const delta = clock.getDelta();
  const time = clock.getElapsedTime();
  angle += delta * 1.5;

  // Animate each cube with a wave effect and a slight rotation
  cubes.forEach(cube => {
    const { x, z } = cube.position;
    cube.position.y = Math.sin(time + x + z) * 1.5;
    cube.rotation.y += 0.01;
  });

  // Map p5 mouse positions to camera rotations
  const mx = map(mouseX, 0, width, -1, 1);
  const my = map(mouseY, 0, height, -1, 1);
  camera.rotation.y = -mx * Math.PI * 0.5; // Invert for intuitive left/right movement
  camera.rotation.x = my * Math.PI * 0.5;

  // Render the three.js scene
  renderer.render(scene, camera);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  renderer.setSize(windowWidth, windowHeight);
  camera.aspect = windowWidth / windowHeight;
  camera.updateProjectionMatrix();
}
