import * as THREE from "three";
import { createRoot } from 'react-dom/client';
import React from 'react';
import UI from './ui.jsx';
import {setupScene} from './setupScene.js';
import {CSS2DObject} from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import {parseDateTime, advanceTime} from './timeUtils.js';
import {createPlanetMeshes, updatePositions} from './planets.js';
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

const uiRoot = document.getElementById('ui-root');
if (uiRoot) {
  const root = createRoot(uiRoot);
  root.render(<UI />);
}

// Wait for the React UI to finish mounting before initializing the scene
if (document.getElementById('datetime')) {
  requestAnimationFrame(init);
} else {
  window.addEventListener('ui-ready', () => requestAnimationFrame(init), { once: true });
}

function init() {
  const container = document.body;
  const {scene, camera, renderer, controls, light, labelRenderer} = setupScene(container);
  let toi = parseDateTime(document.getElementById('datetime').value);
  const clock = new THREE.Clock();
  let playing = false;
  let speed = 1;

  let {objects, bodies} = createPlanetMeshes(toi);
  objects.forEach(obj => {
    if (obj !== bodies.moon.mesh) {
      scene.add(obj);
    }
  });

const labels = [];
for (const [name, body] of Object.entries(bodies)) {
  const div = document.createElement('div');
  div.className = 'label';
  div.textContent = name.charAt(0).toUpperCase() + name.slice(1);
  const label = new CSS2DObject(div);
  label.position.set(0, 0.3, 0);
  body.mesh.add(label);
  labels.push(label);
}
const orbits = objects.filter(o => o.type === 'LineLoop');

async function animate() {
  requestAnimationFrame(animate);
  if (playing) {
    const delta = clock.getDelta();
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
    await updatePositions(bodies, toi);
  }
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
  await updatePositions(bodies, toi);
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

const orbitToggle = document.getElementById('orbitToggle');
orbitToggle.addEventListener('change', () => {
  orbits.forEach(o => o.visible = orbitToggle.checked);
});
orbits.forEach(o => o.visible = orbitToggle.checked);

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
