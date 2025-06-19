import * as THREE from 'three';
import {createSun} from 'astronomy-bundle/sun';
import {createEarth, createMars, createJupiter} from 'astronomy-bundle/planets';

const SCALE = 5; // scale factor for visualization

export function createPlanetMeshes(toi) {
  const sun = createSun(toi);
  const earth = createEarth(toi);
  const mars = createMars(toi);
  const jupiter = createJupiter(toi);

  const sunMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    new THREE.MeshBasicMaterial({color: 0xffff00})
  );

  const earthMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 32, 32),
    new THREE.MeshStandardMaterial({color: 0x3366ff})
  );

  const marsMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 32, 32),
    new THREE.MeshStandardMaterial({color: 0xff5533})
  );

  const jupiterMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 32, 32),
    new THREE.MeshStandardMaterial({color: 0xffaa33})
  );

  const earthOrbit = createOrbitLine(1 * SCALE);
  const marsOrbit = createOrbitLine(1.52 * SCALE);
  const jupiterOrbit = createOrbitLine(5.2 * SCALE);

  return {
    objects: [sunMesh, earthMesh, marsMesh, jupiterMesh, earthOrbit, marsOrbit, jupiterOrbit],
    bodies: {
      sun: {mesh: sunMesh, astro: sun},
      earth: {mesh: earthMesh, astro: earth},
      mars: {mesh: marsMesh, astro: mars},
      jupiter: {mesh: jupiterMesh, astro: jupiter},
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

  const marsCoords = await bodies.mars.astro.getHeliocentricEclipticRectangularJ2000Coordinates();
  bodies.mars.mesh.position.set(marsCoords.x * SCALE, marsCoords.z * SCALE, marsCoords.y * SCALE);

  const jupiterCoords = await bodies.jupiter.astro.getHeliocentricEclipticRectangularJ2000Coordinates();
  bodies.jupiter.mesh.position.set(jupiterCoords.x * SCALE, jupiterCoords.z * SCALE, jupiterCoords.y * SCALE);
}
