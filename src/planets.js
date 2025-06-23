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
import planetElements from 'astronomia/planetelements';
import base from 'astronomia/base';
import { kepler2b, kepler3, trueAnomaly, radius } from 'astronomia/kepler';
import { heliocentric as plutoHeliocentric } from 'astronomia/pluto';
import { PlanetOrbitalPeriod } from 'astronomy-engine';

const SCALE = 5; // scale factor for visualization
// The planets are intentionally oversized for visibility. Without additional
// scaling the Moon would sit inside the Earth, so enlarge its distance.
const MOON_DISTANCE_MULTIPLIER = 50; // increased separation from Earth

const ISS_ORBIT_RADIUS = 0.3; // increased distance from Earth's center

const loader = new THREE.TextureLoader();
loader.setCrossOrigin('anonymous');

// Use more segments for smoother looking spheres
function createSphereMesh(radius, color, texturePath, segments = 64, receiveShadow = false) {
  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  const material = new THREE.MeshStandardMaterial({color});
  loader.load(
    texturePath,
    tex => {
      material.map = tex;
      // Remove tint so the texture's true colors show
      material.color.set(0xffffff);
      material.needsUpdate = true;
    },
    undefined,
    () => {
      // ignore loading errors and keep fallback color
    }
  );
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = receiveShadow;
  return mesh;
}

function createCubeMesh(size, color) {
  const geometry = new THREE.BoxGeometry(size, size, size);
  const material = new THREE.MeshStandardMaterial({ color });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  return mesh;
}

function createRingMesh(innerRadius, outerRadius, texturePath, segments = 64) {
  const geometry = new THREE.RingGeometry(innerRadius, outerRadius, segments);
  // Double side so texture is visible from above and below
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    transparent: true
  });
  loader.load(
    texturePath,
    tex => {
      material.map = tex;
      material.needsUpdate = true;
    },
    undefined,
    () => {}
  );
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  // Orient the ring around the equatorial plane
  mesh.rotation.x = Math.PI / 2;
  return mesh;
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

  const sunMesh = createSphereMesh(0.5, 0xffff00, 'textures/sun.jpg');
  sunMesh.material.emissive = new THREE.Color(0xffffff);
  sunMesh.material.emissiveIntensity = 1;

  const mercuryMesh = createSphereMesh(0.1, 0xaaaaaa, 'textures/mercury.jpg');

  const venusMesh = createSphereMesh(0.15, 0xffddaa, 'textures/venus.jpg');

  // Use a white base color so the texture appears unmodified
  const earthMesh = createSphereMesh(0.2, 0xffffff, 'textures/earth.jpg', 64, true);

  // Slightly higher detail for the moon
  const moonMesh = createSphereMesh(0.05, 0xdddddd, 'textures/moon.jpg', 96);

  const marsMesh = createSphereMesh(0.15, 0xff5533, 'textures/mars.jpg');

  const jupiterMesh = createSphereMesh(0.3, 0xffaa33, 'textures/jupiter.jpg');

  const saturnMesh = createSphereMesh(0.25, 0xffcc88, 'textures/saturn.jpg');
  const saturnRing = createRingMesh(0.35, 0.55, 'textures/saturn_ring.png');
  saturnMesh.add(saturnRing);

  const uranusMesh = createSphereMesh(0.22, 0x66bbff, 'textures/uranus.jpg');

  const neptuneMesh = createSphereMesh(0.21, 0x4477ff, 'textures/neptune.jpg');
  const plutoMesh = createSphereMesh(0.1, 0xbbbbbb, 'textures/pluto.jpg');
  const issMesh = createCubeMesh(0.03, 0xffffff);

  const mercuryOrbit = createPlanetOrbitLine('mercury');
  const venusOrbit = createPlanetOrbitLine('venus');
  const earthOrbit = createPlanetOrbitLine('earth');
  // The average Earth–Moon distance is about 0.00257 AU. With the planets
  // enlarged for visibility we need to scale this distance up so the Moon
  // is positioned outside of the Earth mesh.
  const moonOrbit = createCircularOrbitLine(0.00257 * SCALE * MOON_DISTANCE_MULTIPLIER);
  const marsOrbit = createPlanetOrbitLine('mars');
  const jupiterOrbit = createPlanetOrbitLine('jupiter');
  const saturnOrbit = createPlanetOrbitLine('saturn');
  const uranusOrbit = createPlanetOrbitLine('uranus');
  const neptuneOrbit = createPlanetOrbitLine('neptune');
  const plutoOrbit = createPlutoOrbitLine();
  const issOrbit = createCircularOrbitLine(ISS_ORBIT_RADIUS);
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

const RAD = Math.PI / 180;

function createEllipseLine(el, segments = 180) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array((segments + 1) * 3);
  const n = base.K / el.a / Math.sqrt(el.a);
  for (let i = 0; i <= segments; i++) {
    const M = (i / segments) * 2 * Math.PI;
    const jd = el.epoch + M / n;
    const { x, y, z } = heliocentricCoords(el, jd);
    positions[i * 3] = x * SCALE;
    positions[i * 3 + 1] = z * SCALE;
    positions[i * 3 + 2] = y * SCALE;
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const material = new THREE.LineBasicMaterial({ color: 0x888888 });
  return new THREE.LineLoop(geometry, material);
}

function heliocentricCoords(el, jd) {
  const e = el.e;
  const a = el.a;
  const inc = el.i * RAD;
  const Omega = el.Omega * RAD;
  const w = el.w * RAD;
  const M0 = el.M0 * RAD;
  const n = base.K / a / Math.sqrt(a);
  const M = M0 + n * (jd - el.epoch);
  let E;
  try {
    E = kepler2b(e, M, 8);
  } catch (err) {
    E = kepler3(e, M);
  }
  const nu = trueAnomaly(E, e);
  const r = radius(E, e, a);
  const [sO, cO] = [Math.sin(Omega), Math.cos(Omega)];
  const [si, ci] = [Math.sin(inc), Math.cos(inc)];
  const sE = base.SOblJ2000;
  const cE = base.COblJ2000;
  const F = cO;
  const G = sO * cE;
  const H = sO * sE;
  const P = -sO * ci;
  const Q = cO * ci * cE - si * sE;
  const R = cO * ci * sE + si * cE;
  const A = Math.atan2(F, P);
  const B = Math.atan2(G, Q);
  const C = Math.atan2(H, R);
  const a1 = Math.hypot(F, P);
  const b1 = Math.hypot(G, Q);
  const c1 = Math.hypot(H, R);
  const angle = w + nu;
  const x = r * a1 * Math.sin(A + angle);
  const y = r * b1 * Math.sin(B + angle);
  const z = r * c1 * Math.sin(C + angle);
  return { x, y, z };
}

function createPlanetOrbitLine(name, segments = 180) {
  const jd0 = 2451545.0; // J2000
  const elMean = planetElements.mean(name, jd0);
  const node = isNaN(elMean.node) ? 0 : elMean.node;
  const elements = {
    a: elMean.axis,
    e: elMean.ecc,
    i: elMean.inc * 180 / Math.PI,
    Omega: node * 180 / Math.PI,
    w: (elMean.peri - node) * 180 / Math.PI,
    M0: (elMean.lon - elMean.peri) * 180 / Math.PI,
    epoch: jd0
  };
  return createEllipseLine(elements, segments);
}

function createCircularOrbitLine(radius, segments = 180) {
  const geometry = new THREE.BufferGeometry();
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
  }
  geometry.setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: 0x888888 });
  return new THREE.LineLoop(geometry, material);
}

function createPlutoOrbitLine(segments = 180) {
  const jd0 = 2451545.0; // J2000
  const period = PlanetOrbitalPeriod('Pluto');
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array((segments + 1) * 3);
  for (let i = 0; i <= segments; i++) {
    const jd = jd0 + period * (i / segments);
    const { lon, lat, range } = plutoHeliocentric(jd);
    const x = range * Math.cos(lon) * Math.cos(lat);
    const y = range * Math.sin(lon) * Math.cos(lat);
    const z = range * Math.sin(lat);
    positions[i * 3] = x * SCALE;
    positions[i * 3 + 1] = z * SCALE;
    positions[i * 3 + 2] = y * SCALE;
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const material = new THREE.LineBasicMaterial({ color: 0x888888 });
  return new THREE.LineLoop(geometry, material);
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
