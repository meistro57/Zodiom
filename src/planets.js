import * as THREE from 'three';
import {createSun} from 'astronomy-bundle/sun';
import {
  createMercury,
  createVenus,
  createMars,
  createJupiter,
  createSaturn,
  createUranus,
  createNeptune
} from 'astronomy-bundle/planets';
import { createEarth } from 'astronomy-bundle/earth';
import { createMoon } from 'astronomy-bundle/moon';
import createPluto from './pluto.js';

const SCALE = 5; // scale factor for visualization
// The planets are intentionally oversized for visibility. Without additional
// scaling the Moon would sit inside the Earth, so enlarge its distance.
const MOON_DISTANCE_MULTIPLIER = 50; // increased separation from Earth

const ISS_ORBIT_RADIUS = 0.3; // increased distance from Earth's center

const loader = new THREE.TextureLoader();

// Use more segments for smoother looking spheres
function createSphereMesh(radius, color, texturePath, segments = 64) {
  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  const material = new THREE.MeshStandardMaterial({color});
  loader.load(
    texturePath,
    tex => {
      material.map = tex;
      material.needsUpdate = true;
    },
    undefined,
    () => {
      // ignore loading errors and keep fallback color
    }
  );
  return new THREE.Mesh(geometry, material);
}

function createCubeMesh(size, color) {
  const geometry = new THREE.BoxGeometry(size, size, size);
  const material = new THREE.MeshStandardMaterial({ color });
  return new THREE.Mesh(geometry, material);
}

function createAsteroidBelt(count = 1000, innerRadius = 2.2 * SCALE, outerRadius = 3.2 * SCALE) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = THREE.MathUtils.lerp(innerRadius, outerRadius, Math.random());
    const theta = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 0.1 * SCALE;
    positions[i * 3] = Math.cos(theta) * r;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = Math.sin(theta) * r;
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0x888888, size: 0.03 });
  return new THREE.Points(geometry, material);
}

export function createPlanetMeshes(toi) {
  const sun = createSun(toi);
  const mercury = createMercury(toi);
  const venus = createVenus(toi);
  const earth = createEarth(toi);
  const moon = createMoon(toi);
  const mars = createMars(toi);
  const jupiter = createJupiter(toi);
  const saturn = createSaturn(toi);
  const uranus = createUranus(toi);
  const neptune = createNeptune(toi);
  const pluto = createPluto(toi);

  const sunMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 64, 64),
    new THREE.MeshBasicMaterial({color: 0xffff00})
  );

  const mercuryMesh = createSphereMesh(0.1, 0xaaaaaa, 'textures/mercury.jpg');

  const venusMesh = createSphereMesh(0.15, 0xffddaa, 'textures/venus.jpg');

  const earthMesh = createSphereMesh(0.2, 0x3366ff, 'textures/earth.jpg');

  // Slightly higher detail for the moon
  const moonMesh = createSphereMesh(0.05, 0xdddddd, 'textures/moon.jpg', 96);

  const marsMesh = createSphereMesh(0.15, 0xff5533, 'textures/mars.jpg');

  const jupiterMesh = createSphereMesh(0.3, 0xffaa33, 'textures/jupiter.jpg');

  const saturnMesh = createSphereMesh(0.25, 0xffcc88, 'textures/saturn.jpg');

  const uranusMesh = createSphereMesh(0.22, 0x66bbff, 'textures/uranus.jpg');

  const neptuneMesh = createSphereMesh(0.21, 0x4477ff, 'textures/neptune.jpg');
  const plutoMesh = createSphereMesh(0.1, 0xbbbbbb, 'textures/pluto.jpg');
  const issMesh = createCubeMesh(0.03, 0xffffff);

  const mercuryOrbit = createOrbitLine(0.39 * SCALE);
  const venusOrbit = createOrbitLine(0.72 * SCALE);
  const earthOrbit = createOrbitLine(1 * SCALE);
  // The average Earth–Moon distance is about 0.00257 AU. With the planets
  // enlarged for visibility we need to scale this distance up so the Moon
  // is positioned outside of the Earth mesh.
  const moonOrbit = createOrbitLine(0.00257 * SCALE * MOON_DISTANCE_MULTIPLIER);
  const marsOrbit = createOrbitLine(1.52 * SCALE);
  const jupiterOrbit = createOrbitLine(5.2 * SCALE);
  const saturnOrbit = createOrbitLine(9.58 * SCALE);
  const uranusOrbit = createOrbitLine(19.2 * SCALE);
  const neptuneOrbit = createOrbitLine(30.1 * SCALE);
  const plutoOrbit = createOrbitLine(39.5 * SCALE);
  const issOrbit = createOrbitLine(ISS_ORBIT_RADIUS);
  const asteroidBelt = createAsteroidBelt();

  earthMesh.add(moonOrbit);
  earthMesh.add(issOrbit);
  // Parent the moon and ISS to the earth so they orbit correctly
  earthMesh.add(moonMesh);
  earthMesh.add(issMesh);

  return {
    objects: [
      sunMesh,
      mercuryMesh,
      venusMesh,
      earthMesh,
      moonMesh,
      marsMesh,
      jupiterMesh,
      saturnMesh,
      uranusMesh,
      neptuneMesh,
      plutoMesh,
      issMesh,
      mercuryOrbit,
      venusOrbit,
      earthOrbit,
      moonOrbit,
      issOrbit,
      marsOrbit,
      jupiterOrbit,
      saturnOrbit,
      uranusOrbit,
      neptuneOrbit,
      plutoOrbit,
      asteroidBelt
    ],
    moonOrbit,
    issOrbit,
    bodies: {
      sun: {mesh: sunMesh, astro: sun},
      mercury: {mesh: mercuryMesh, astro: mercury},
      venus: {mesh: venusMesh, astro: venus},
      earth: {mesh: earthMesh, astro: earth},
      moon: {mesh: moonMesh, astro: moon},
      mars: {mesh: marsMesh, astro: mars},
      jupiter: {mesh: jupiterMesh, astro: jupiter},
      saturn: {mesh: saturnMesh, astro: saturn},
      uranus: {mesh: uranusMesh, astro: uranus},
      neptune: {mesh: neptuneMesh, astro: neptune},
      pluto: {mesh: plutoMesh, astro: pluto},
      iss: {mesh: issMesh, astro: null}
    }
  };
}

function createOrbitLine(radius) {
  const segments = 64;
  const geometry = new THREE.BufferGeometry();
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
  }
  geometry.setFromPoints(points);
  const material = new THREE.LineBasicMaterial({color: 0x888888});
  const line = new THREE.LineLoop(geometry, material);
  return line;
}

export async function updatePositions(bodies, toi) {
  // Sun at origin
  bodies.sun.mesh.position.set(0, 0, 0);

  const earthCoords = await bodies.earth.astro.getHeliocentricEclipticRectangularJ2000Coordinates();
  bodies.earth.mesh.position.set(earthCoords.x * SCALE, earthCoords.z * SCALE, earthCoords.y * SCALE);

  const moonCoords = await bodies.moon.astro.getGeocentricEclipticRectangularJ2000Coordinates();
  bodies.moon.mesh.position.set(
    moonCoords.x * SCALE * MOON_DISTANCE_MULTIPLIER,
    moonCoords.z * SCALE * MOON_DISTANCE_MULTIPLIER,
    moonCoords.y * SCALE * MOON_DISTANCE_MULTIPLIER
  );

  const mercuryCoords = await bodies.mercury.astro.getHeliocentricEclipticRectangularJ2000Coordinates();
  bodies.mercury.mesh.position.set(mercuryCoords.x * SCALE, mercuryCoords.z * SCALE, mercuryCoords.y * SCALE);

  const venusCoords = await bodies.venus.astro.getHeliocentricEclipticRectangularJ2000Coordinates();
  bodies.venus.mesh.position.set(venusCoords.x * SCALE, venusCoords.z * SCALE, venusCoords.y * SCALE);

  const marsCoords = await bodies.mars.astro.getHeliocentricEclipticRectangularJ2000Coordinates();
  bodies.mars.mesh.position.set(marsCoords.x * SCALE, marsCoords.z * SCALE, marsCoords.y * SCALE);

  const jupiterCoords = await bodies.jupiter.astro.getHeliocentricEclipticRectangularJ2000Coordinates();
  bodies.jupiter.mesh.position.set(jupiterCoords.x * SCALE, jupiterCoords.z * SCALE, jupiterCoords.y * SCALE);

  const saturnCoords = await bodies.saturn.astro.getHeliocentricEclipticRectangularJ2000Coordinates();
  bodies.saturn.mesh.position.set(saturnCoords.x * SCALE, saturnCoords.z * SCALE, saturnCoords.y * SCALE);

  const uranusCoords = await bodies.uranus.astro.getHeliocentricEclipticRectangularJ2000Coordinates();
  bodies.uranus.mesh.position.set(uranusCoords.x * SCALE, uranusCoords.z * SCALE, uranusCoords.y * SCALE);

  const neptuneCoords = await bodies.neptune.astro.getHeliocentricEclipticRectangularJ2000Coordinates();
  bodies.neptune.mesh.position.set(neptuneCoords.x * SCALE, neptuneCoords.z * SCALE, neptuneCoords.y * SCALE);

  const plutoCoords = await bodies.pluto.astro.getHeliocentricEclipticRectangularJ2000Coordinates();
  bodies.pluto.mesh.position.set(plutoCoords.x * SCALE, plutoCoords.z * SCALE, plutoCoords.y * SCALE);

  // Simple circular orbit for the ISS around Earth
  const t = (toi.getDate ? toi.getDate() : toi).getTime() / 1000;
  const period = 92 * 60; // seconds
  const angle = (t % period) / period * Math.PI * 2;
  bodies.iss.mesh.position.set(
    Math.cos(angle) * ISS_ORBIT_RADIUS,
    0,
    Math.sin(angle) * ISS_ORBIT_RADIUS
  );
}
