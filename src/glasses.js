import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

const axes = new THREE.AxesHelper(2);
scene.add(axes);

const hdrTextureLoader = new RGBELoader();
const rotationObject = new THREE.Object3D();
const spheres = [];

hdrTextureLoader.load("/textures/workshop.hdr", function (texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;

  const sphereGeometry = new THREE.SphereGeometry(0.2, 32, 32);

  const sphereMaterial = new THREE.MeshPhysicalMaterial({
    roughness: 0,
    metalness: 0,
    transmission: 1,
    ior: 2.33,
    clearcoat: 0,
    clearcoatRoughness: 0,
    envMap: texture,
    depthWrite: false,
  });

  // Calculate the radius for the spheres to achieve even spacing
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  const sphereRadius = 1 / (goldenRatio + 1);

  // Coordonnées des sommets du dodécaèdre
  const vertices = [
    [-1, goldenRatio, 0],
    [1, goldenRatio, 0],
    [-1, -goldenRatio, 0],
    [1, -goldenRatio, 0],
    [0, -1, goldenRatio],
    [0, 1, goldenRatio],
    [0, -1, -goldenRatio],
    [0, 1, -goldenRatio],
    [goldenRatio, 0, -1],
    [goldenRatio, 0, 1],
    [-goldenRatio, 0, -1],
    [-goldenRatio, 0, 1],
  ];

  for (let i = 0; i < vertices.length; i++) {
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(
      vertices[i][0] * sphereRadius,
      vertices[i][1] * sphereRadius,
      vertices[i][2] * sphereRadius
    );
    spheres.push(sphere);
    rotationObject.add(sphere);

    const planeGeometry = new THREE.PlaneGeometry(
      Math.sqrt(0.05),
      Math.sqrt(0.05)
    );
    const planeMaterial = new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      //side: FrontSide,
      transparent: true,
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);

    sphere.add(plane);
  }

  scene.add(rotationObject);
  rotationObject.position.set(0, 0, 0);
});

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
  100
);
camera.position.set(0, 0, 4);
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

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  for (let i = 0; i < spheres.length; i++) {
    let sphere = spheres[i];
    // Calcule la direction vers la caméra
    let direction = new THREE.Vector3().subVectors(
      camera.position,
      sphere.position
    );
    sphere.lookAt(direction);
  }

  rotationObject.rotation.z += 0.002;
  rotationObject.rotation.x += 0.002;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
