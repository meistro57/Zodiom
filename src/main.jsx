import * as THREE from "three";
import {setupScene} from './setupScene.js';
import {CSS2DObject} from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import {parseDateTime, advanceTime} from './timeUtils.js';
import {createPlanetMeshes, updatePositions} from './planets.js';
import {createSmallBodyMeshes, updateSmallBodyPositions} from './smallBodies.js';
import {
  createMercury,
  createVenus,
  createMars,
  createJupiter,
  createSaturn,
  createUranus,
  createNeptune
} from "astronomy-bundle/planets";
import { createEarth } from "astronomy-bundle/earth";
import { createMoon } from "astronomy-bundle/moon";
import {createSun as createSunSolo} from "astronomy-bundle/sun";
import createPluto from './pluto.js';

// Wait for the React UI to finish mounting before initializing the scene
window.addEventListener('ui-ready', () => requestAnimationFrame(init), { once: true });

function init() {
  const container = document.body;
  const {scene, camera, renderer, controls, light, labelRenderer} = setupScene(container);
  let toi = parseDateTime(document.getElementById('datetime').value);
  const clock = new THREE.Clock();
  let playing = false;
  let speed = 1;

  let {objects, bodies, moonOrbit, issOrbit} = createPlanetMeshes(toi);
  let smallBodies;
  const result = createSmallBodyMeshes(toi);
  const sbObjects = result.objects;
  smallBodies = result.bodies;
  objects = objects.concat(sbObjects);
  Object.assign(bodies, smallBodies);
  objects.forEach(obj => {
    if (obj !== bodies.moon.mesh && obj !== moonOrbit && obj !== bodies.iss.mesh && obj !== issOrbit) {
      scene.add(obj);
    }
  });

const labels = [];
for (const [name, body] of Object.entries(bodies)) {
  if (!body.mesh) continue; // skip helper properties like _sim
  const div = document.createElement('div');
  div.className = 'label';
  div.textContent = name.charAt(0).toUpperCase() + name.slice(1);
  const label = new CSS2DObject(div);
  label.position.set(0, 0.3, 0);
  body.mesh.add(label);
  labels.push(label);
}
  const orbits = objects.filter(o => o.type === 'LineLoop');

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const bodyMeshes = Object.values(bodies)
    .filter(b => b.mesh)
    .map(b => b.mesh);

  renderer.domElement.addEventListener('dblclick', event => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(bodyMeshes, true);
    if (hits.length > 0) {
      const pos = new THREE.Vector3();
      hits[0].object.getWorldPosition(pos);
      controls.target.copy(pos);
      const dir = camera.position.clone().sub(pos).normalize();
      camera.position.copy(pos.clone().add(dir.multiplyScalar(2)));
      controls.update();
    }
  });

async function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (playing) {
    toi = advanceTime(toi, delta * 86400000 * speed); // advance with speed factor
    document.getElementById('datetime').value = toi.getDate().toISOString().slice(0,16);
    bodies.sun.astro = createSunSolo(toi);
    bodies.mercury.astro = createMercury(toi);
    bodies.venus.astro = createVenus(toi);
    bodies.earth.astro = createEarth(toi);
    bodies.moon.astro = createMoon(toi);
    bodies.mars.astro = createMars(toi);
    bodies.jupiter.astro = createJupiter(toi);
    bodies.saturn.astro = createSaturn(toi);
    bodies.uranus.astro = createUranus(toi);
    bodies.neptune.astro = createNeptune(toi);
    bodies.pluto.astro = createPluto(toi);
    await updatePositions(bodies, toi);
    updateSmallBodyPositions(smallBodies, toi);
  }
  Object.values(bodies).forEach(b => {
    if (b.mesh) b.mesh.rotation.y += delta * 0.5;
  });
  controls.update();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}
animate();

async function refresh() {
  toi = parseDateTime(document.getElementById('datetime').value);
  bodies.sun.astro = createSunSolo(toi);
  bodies.mercury.astro = createMercury(toi);
  bodies.venus.astro = createVenus(toi);
  bodies.earth.astro = createEarth(toi);
  bodies.moon.astro = createMoon(toi);
  bodies.mars.astro = createMars(toi);
  bodies.jupiter.astro = createJupiter(toi);
  bodies.saturn.astro = createSaturn(toi);
  bodies.uranus.astro = createUranus(toi);
  bodies.neptune.astro = createNeptune(toi);
  bodies.pluto.astro = createPluto(toi);
  await updatePositions(bodies, toi);
  updateSmallBodyPositions(smallBodies, toi);
}

document.getElementById('go').addEventListener('click', () => {
  refresh();
});

const mysticToggle = document.getElementById('mysticToggle');
mysticToggle.addEventListener('change', () => {
  const mystic = mysticToggle.checked;
  objects.forEach(obj => {
    if (mystic) {
      obj.material.emissive = obj.material.color;
      obj.material.emissiveIntensity = 0.5;
      if (obj.type === 'LineLoop') obj.material.color.set(0xffff00);
    } else {
      obj.material.emissive = new THREE.Color(0x000000);
      obj.material.emissiveIntensity = 0;
      if (obj.type === 'LineLoop') obj.material.color.set(0x888888);
    }
    obj.material.needsUpdate = true;
  });
});

const lightToggle = document.getElementById('lightToggle');
lightToggle.addEventListener('change', () => {
  if (lightToggle.checked) {
    document.body.classList.add('light');
  } else {
    document.body.classList.remove('light');
  }
});

const labelToggle = document.getElementById('labelToggle');
labelToggle.addEventListener('change', () => {
  labels.forEach(l => l.visible = labelToggle.checked);
});
labels.forEach(l => l.visible = labelToggle.checked);

const issToggle = document.getElementById('issToggle');
issToggle.addEventListener('change', () => {
  bodies.iss.mesh.visible = issToggle.checked;
  issOrbit.visible = issToggle.checked && orbitToggle.checked;
});

const orbitToggle = document.getElementById('orbitToggle');
orbitToggle.addEventListener('change', () => {
  orbits.forEach(o => o.visible = orbitToggle.checked);
  if (!issToggle.checked) issOrbit.visible = false;
});
orbits.forEach(o => o.visible = orbitToggle.checked);
if (!issToggle.checked) issOrbit.visible = false;
bodies.iss.mesh.visible = issToggle.checked;

const speedRange = document.getElementById('speedRange');
speedRange.addEventListener('input', () => {
  speed = parseFloat(speedRange.value);
});

const resetBtn = document.getElementById('resetCamera');
resetBtn.addEventListener('click', () => {
  camera.position.set(0, 5, 10);
  controls.target.set(0, 0, 0);
  controls.update();
});

const playBtn = document.getElementById('playTimeline');
playBtn.addEventListener('click', () => {
  playing = !playing;
  playBtn.textContent = playing ? 'Pause Timeline' : 'Play Timeline';
  clock.getDelta();
});

refresh();
}
