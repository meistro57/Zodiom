import * as THREE from "three";
import {setupScene} from './setupScene.js';
import {parseDateTime} from './timeUtils.js';
import {createPlanetMeshes, updatePositions} from './planets.js';
import {createEarth, createMars} from "astronomy-bundle/planets";
import {createSun as createSunSolo} from "astronomy-bundle/sun";
const container = document.body;
const {scene, camera, renderer, controls, light} = setupScene(container);
let toi = parseDateTime(document.getElementById('datetime').value);

let {objects, bodies} = createPlanetMeshes(toi);
objects.forEach(obj => scene.add(obj));

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

async function refresh() {
  toi = parseDateTime(document.getElementById('datetime').value);
  bodies.sun.astro = createSunSolo(toi);
  bodies.earth.astro = createEarth(toi);
  bodies.mars.astro = createMars(toi);
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

refresh();
