import * as THREE from "three";
import {setupScene} from './setupScene.js';
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
import {createSun as createSunSolo} from "astronomy-bundle/sun";
const container = document.body;
const {scene, camera, renderer, controls, light} = setupScene(container);
let toi = parseDateTime(document.getElementById('datetime').value);
const clock = new THREE.Clock();
let playing = false;

let {objects, bodies} = createPlanetMeshes(toi);
objects.forEach(obj => scene.add(obj));

async function animate() {
  requestAnimationFrame(animate);
  if (playing) {
    const delta = clock.getDelta();
    toi = advanceTime(toi, delta * 86400000); // advance one day per second
    document.getElementById('datetime').value = toi.getDate().toISOString().slice(0,16);
    bodies.sun.astro = createSunSolo(toi);
    bodies.mercury.astro = createMercury(toi);
    bodies.venus.astro = createVenus(toi);
    bodies.earth.astro = createEarth(toi);
    bodies.mars.astro = createMars(toi);
    bodies.jupiter.astro = createJupiter(toi);
    bodies.saturn.astro = createSaturn(toi);
    bodies.uranus.astro = createUranus(toi);
    bodies.neptune.astro = createNeptune(toi);
    await updatePositions(bodies, toi);
  }
  controls.update();
  renderer.render(scene, camera);
}
animate();

async function refresh() {
  toi = parseDateTime(document.getElementById('datetime').value);
  bodies.sun.astro = createSunSolo(toi);
  bodies.mercury.astro = createMercury(toi);
  bodies.venus.astro = createVenus(toi);
  bodies.earth.astro = createEarth(toi);
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

const playBtn = document.getElementById('playTimeline');
playBtn.addEventListener('click', () => {
  playing = !playing;
  playBtn.textContent = playing ? 'Pause Timeline' : 'Play Timeline';
  clock.getDelta();
});

refresh();
