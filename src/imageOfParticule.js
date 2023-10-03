import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import vertexShader from "./shaders/imagesParticules/vertex.glsl";
import fragmentShader from "./shaders/imagesParticules/fragment.glsl";
import { randFloat } from "three/src/math/MathUtils";
import gsap from "gsap";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();
const guiObject = {
  progress: 0,
  frequency: 0.19,
};

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

const axes = new THREE.AxesHelper(2);
scene.add(axes);

scene.background = new THREE.Color(0x000000);

const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load("/images/shelby.jpg");

const geometry = new THREE.BufferGeometry();

const multiplier = 18;
const nbColumns = 16 * multiplier;
const nbLines = 16 * multiplier;
const vertices = [];
const intPositions = [];
const pointSize = 8;

for (let i = 0; i < nbColumns; i++) {
  for (let y = 0; y < nbLines; y++) {
    const point = [i, y, 0];
    const initPoint = [i - nbColumns / 2, y - nbLines / 2, randFloat(0, 800)];

    vertices.push(...point);
    intPositions.push(...initPoint);
  }
}

// Créez une forme carrée simple. Nous dupliquons les sommets en haut à gauche et en bas à droite
// car chaque sommet doit apparaître une fois par triangle.
const vertices32 = new Float32Array(vertices);
const initPositions32 = new Float32Array(intPositions);
const uMousePos = new THREE.Vector3();
// itemSize = 3 car il y a 3 valeurs (composantes) par sommet.
geometry.setAttribute("position", new THREE.BufferAttribute(vertices32, 3));
geometry.setAttribute(
  "initPosition",
  new THREE.BufferAttribute(initPositions32, 3)
);
geometry.center();
const material = new THREE.ShaderMaterial({
  fragmentShader: fragmentShader,
  vertexShader: vertexShader,
  uniforms: {
    uPointSize: { value: pointSize },
    uTexture: { value: texture },
    uNbLines: { value: nbLines },
    uNbColumns: { value: nbColumns },
    uProgress: { value: guiObject.progress },
    uFrequency: { value: guiObject.frequency },
    uTime: { value: 0 },
    uMousePos: { value: uMousePos },
  },
  transparent: true,
  depthTest: false,
  depthWrite: false,
});
const mesh = new THREE.Points(geometry, material);

scene.add(mesh);

/**
 * GUI
 */
gui.add(guiObject, "progress", 0, 1).onChange(() => {
  material.uniforms.uProgress.value = guiObject.progress;
});
gui.add(guiObject, "frequency", 0, 100).onChange(() => {
  material.uniforms.uFrequency.value = guiObject.frequency;
});

gsap.fromTo(
  material.uniforms.uProgress,
  {
    value: 0,
  },
  {
    value: 1,
    duration: 2.5,
    ease: "Power4.easeOut",
  }
);

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
camera.position.set(0, 0, 300);
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

/**
 * Raycaster
 */

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
document.addEventListener("mousemove", onMouseMove);

let isCursorOverMesh = false;

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObject(mesh);

  isCursorOverMesh = intersects.length > 0;

  material.uniforms.uPointSize.value = isCursorOverMesh ? 0.3 : pointSize;
}

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = (time) => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  controls.update();

  //material.uniforms.uTime.value = time;

  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
