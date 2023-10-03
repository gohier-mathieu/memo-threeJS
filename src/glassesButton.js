import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import gsap from "gsap";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

/**
 * Base
 */

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

const axes = new THREE.AxesHelper(2);
//scene.add(axes);

scene.background = new THREE.Color(0x000000);

const hdrTextureLoader = new RGBELoader();
const roundedBoxGeometry = new RoundedBoxGeometry(3, 1, 1, 5, 5);
const roundedBoxMaterial = new THREE.MeshPhysicalMaterial({
  roughness: 0,
  metalness: 0,
  transmission: 1,
  ior: 2.33,
  clearcoat: 0,
  clearcoatRoughness: 0,
  depthWrite: false,
});

const textMaterial = new THREE.MeshStandardMaterial({
  emissive: 0xff0000,
  emissiveIntensity: 0.5,
  color: 0x000000,
  metalness: 0.7,
  roughness: 0.2,
});

const mesh = new THREE.Mesh(roundedBoxGeometry, roundedBoxMaterial);
let text;
const fontLoader = new FontLoader();
hdrTextureLoader.load("/textures/workshop.hdr", function (texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;

  roundedBoxMaterial.envMap = texture;

  mesh.position.set(0, 2, 0);
  scene.add(mesh);

  fontLoader.load("/fonts/helvetiker_regular.typeface.json", (font) => {
    const textGeometry = new TextGeometry("Button", {
      font: font,
      size: 0.5,
      height: 0.0005,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.003,
      bevelSize: 0.002,
      bevelOffset: 0,
      bevelSegments: 1,
    });

    text = new THREE.Mesh(textGeometry, textMaterial);
    mesh.add(text);
    textGeometry.center();
  });
});

const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
const cubeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const cube = new THREE.Mesh(cubeGeo, cubeMat);
scene.add(cube);

/**
 * particules
 */

const particleGeometry = new THREE.BufferGeometry();
const particleMaterial = new THREE.PointsMaterial({
  color: 0x888888,
  size: 0.05,
});
/*
// Create an array to store particle positions
const particlePositions = [];

// Add particle positions to the array (you can adjust the number of particles)
for (let i = 0; i < 100; i++) {
  const x = (Math.random() - 0.5) * 2.8; // Random x position within the box
  const y = (Math.random() - 0.5) * 0.8; // Random y position within the box
  const z = (Math.random() - 0.5) * 0.8; // Random z position within the box

  particlePositions.push(x, y, z);
}

// Set the positions as an attribute of the particle geometry
particleGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(particlePositions, 3)
);

// Create the particle system
const particleSystem = new THREE.Points(particleGeometry, particleMaterial);

// Add the particle system to the scene
mesh.add(particleSystem);
*/
/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  10000
);
camera.position.set(0, 0, 5);
camera.lookAt(0, 0, 0);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0.75, 0);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.domElement.addEventListener("click", onCanvasClick);

let isCubeGreen = false;
let isCursorOverMesh = false;

function onCanvasClick(event) {
  // Calculez la position normalisée de la souris
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Utilisez le raycaster pour détecter les intersections avec l'objet mesh
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObject(mesh);

  if (intersects.length > 0) {
    // L'objet mesh a été cliqué, vous pouvez mettre ici votre code pour effectuer des actions lors du clic
    if (isCubeGreen) {
      cube.material.color.set(0xff0000);
      text.material.emissive.set(0xff0000);
    } else {
      cube.material.color.set(0x00ff00);
      text.material.emissive.set(0x00ff00);
    }
    isCubeGreen = !isCubeGreen;
  }
}

/**
 * Raycaster
 */

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
document.addEventListener("mousemove", onMouseMove);

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;
let INTERSECTED;

const tick = (time) => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // Update controls
  controls.update();

  raycaster.setFromCamera(mouse, camera);

  // calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(scene.children);

  let isMeshHovered = false;

  for (let i = 0; i < intersects.length; i++) {
    const intersectedObject = intersects[i].object;

    if (intersectedObject === mesh) {
      if (text && text.material) {
        text.material.emissiveIntensity = 50;
      }
      isMeshHovered = true;
    }
  }

  if (!isMeshHovered && text && text.material) {
    text.material.emissiveIntensity = 1;
  }
  /*
  const particleSpeed = 0.05; // Adjust the speed as needed

  // Update particle positions
  const positions = particleGeometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] += Math.random() * particleSpeed - particleSpeed / 2;
    positions[i + 1] += Math.random() * particleSpeed - particleSpeed / 2;
    positions[i + 2] += Math.random() * particleSpeed - particleSpeed / 2;

    // Limitez les positions des particules à l'intérieur de l'objet mesh
    positions[i] = Math.max(-2.8, Math.min(2.8, positions[i])); // Ajustez les limites en fonction de la taille de l'objet
    positions[i + 1] = Math.max(-0.8, Math.min(0.8, positions[i + 1]));
    positions[i + 2] = Math.max(-0.8, Math.min(0.8, positions[i + 2]));
  }

  // Notify Three.js that the particle positions have changed
  particleGeometry.attributes.position.needsUpdate = true;
*/
  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
