import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {CSS2DRenderer} from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader.js';

const STAR_VERT = `
  attribute vec3 aColor;
  attribute float aSize;
  varying vec3 vColor;
  void main() {
    vColor = aColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (250.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const STAR_FRAG = `
  varying vec3 vColor;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.1, d);
    gl_FragColor = vec4(vColor, alpha);
  }
`;

function createStarfield(count = 20000, radius = 200) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  // Most stars are white; sprinkle in blue-white, orange, red-orange
  const palette = [
    [1.00, 1.00, 1.00],
    [1.00, 1.00, 1.00],
    [1.00, 1.00, 1.00],
    [1.00, 1.00, 1.00],
    [0.85, 0.90, 1.00],
    [0.90, 0.95, 1.00],
    [1.00, 0.92, 0.75],
    [1.00, 0.88, 0.65],
    [1.00, 0.75, 0.60],
  ];

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    const sinPhi = Math.sin(phi);
    positions[i * 3]     = radius * sinPhi * Math.cos(theta);
    positions[i * 3 + 1] = radius * sinPhi * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);

    const c = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3]     = c[0];
    colors[i * 3 + 1] = c[1];
    colors[i * 3 + 2] = c[2];

    sizes[i] = Math.random() * 2.0 + 0.5;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('aColor',   new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute('aSize',    new THREE.Float32BufferAttribute(sizes, 1));

  const material = new THREE.ShaderMaterial({
    vertexShader: STAR_VERT,
    fragmentShader: STAR_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  return new THREE.Points(geometry, material);
}

function createMilkyWay(count = 6000, radius = 196) {
  const positions = new Float32Array(count * 3);
  const colors    = new Float32Array(count * 3);
  const sizes     = new Float32Array(count);

  // Galactic plane tilted ~60° from ecliptic
  const tilt    = 60 * Math.PI / 180;
  const cosTilt = Math.cos(tilt);
  const sinTilt = Math.sin(tilt);

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const band  = (Math.random() - 0.5) * 0.22; // narrow galactic band
    const phi   = Math.PI / 2 + band;
    const sinPhi = Math.sin(phi);

    const x  = radius * sinPhi * Math.cos(theta);
    const y0 = radius * sinPhi * Math.sin(theta);
    const z0 = radius * Math.cos(phi);

    // Rotate into galactic inclination
    positions[i * 3]     = x;
    positions[i * 3 + 1] = y0 * cosTilt - z0 * sinTilt;
    positions[i * 3 + 2] = y0 * sinTilt + z0 * cosTilt;

    const warm = Math.random() * 0.25;
    colors[i * 3]     = 0.82 + warm;
    colors[i * 3 + 1] = 0.82 + warm * 0.4;
    colors[i * 3 + 2] = 0.96;

    sizes[i] = Math.random() * 1.2 + 0.2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('aColor',   new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute('aSize',    new THREE.Float32BufferAttribute(sizes, 1));

  const material = new THREE.ShaderMaterial({
    vertexShader: STAR_VERT,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        if (d > 0.5) discard;
        float alpha = 0.38 * smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  return new THREE.Points(geometry, material);
}

export function setupScene(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 5, 10);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.physicallyCorrectLights = true;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  new RGBELoader().load('textures/royal_esplanade_1k.hdr', tex => {
    tex.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = tex;
    renderer.toneMappingExposure = 1.25;
  });

  const labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  labelRenderer.domElement.style.pointerEvents = 'none';
  container.appendChild(labelRenderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  const ambient = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambient);

  const light = new THREE.PointLight(0xffffff, 1.2);
  light.castShadow = true;
  light.shadow.mapSize.set(2048, 2048);
  light.shadow.camera.near = 0.1;
  light.shadow.camera.far = 100;
  scene.add(light);

  // Stars + Milky Way grouped so the starsToggle controls both
  const starsGroup = new THREE.Group();
  starsGroup.add(createStarfield());
  starsGroup.add(createMilkyWay());
  scene.add(starsGroup);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
  });

  return {scene, camera, renderer, controls, light, labelRenderer, stars: starsGroup};
}
