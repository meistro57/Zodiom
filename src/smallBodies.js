import * as THREE from 'three';
import base from 'astronomia/base';
import { kepler2b, kepler3, trueAnomaly, radius } from 'astronomia/kepler';
import { Body, StateVector, GravitySimulator } from 'astronomy-engine';

const SCALE = 5;
const RAD = Math.PI / 180;

export const SMALL_BODIES = [
  {
    name: 'Ceres',
    elements: {
      a: 2.769289292143484,
      e: 0.07687465013145245,
      i: 10.59127767086216,
      Omega: 80.3011901917491,
      w: 73.80896808746482,
      M0: 130.3159688200986,
      epoch: 2458849.5
    },
    color: 0xbcbcbc
  },
  {
    name: 'Vesta',
    elements: {
      a: 2.361908654291772,
      e: 0.08857261385730482,
      i: 7.14181494423702,
      Omega: 103.8092892453337,
      w: 150.8357762126256,
      M0: 163.3754032354997,
      epoch: 2458849.5
    },
    color: 0xd8d8d8
  },
  {
    name: 'Halley',
    elements: {
      a: 17.93003431157555,
      e: 0.9679221169240834,
      i: 162.1951462980701,
      Omega: 59.07198712310091,
      w: 112.2128395742619,
      M0: 274.8113481508292,
      epoch: 2439907.5
    },
    color: 0xff8800
  },
  {
    name: 'NEOWISE',
    elements: {
      a: 358.4679565529321,
      e: 0.9991780262531292,
      i: 128.9375027594809,
      Omega: 61.01042818536988,
      w: 37.2786584481257,
      M0: 0.0003370720801209784,
      epoch: 2459036.5
    },
    color: 0xffaa55
  }
];

function createSphereMesh(radius, color) {
  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color });
  return new THREE.Mesh(geometry, material);
}

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

function stateVectorFromElements(el, jd) {
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
  const cosE = Math.cos(E);
  const sinE = Math.sin(E);
  const r = a * (1 - e * cosE);
  const xOrb = a * (cosE - e);
  const yOrb = a * Math.sqrt(1 - e * e) * sinE;
  const xdotOrb = -a * n * sinE / (1 - e * cosE);
  const ydotOrb = a * n * Math.sqrt(1 - e * e) * cosE / (1 - e * cosE);

  const cosO = Math.cos(Omega);
  const sinO = Math.sin(Omega);
  const cosi = Math.cos(inc);
  const sini = Math.sin(inc);
  const cosw = Math.cos(w);
  const sinw = Math.sin(w);

  const xEcl = cosO * (cosw * xOrb - sinw * yOrb) - sinO * (sinw * xOrb + cosw * yOrb) * cosi;
  const yEcl = sinO * (cosw * xOrb - sinw * yOrb) + cosO * (sinw * xOrb + cosw * yOrb) * cosi;
  const zEcl = (sinw * xOrb + cosw * yOrb) * sini;

  const vxEcl = cosO * (cosw * xdotOrb - sinw * ydotOrb) - sinO * (sinw * xdotOrb + cosw * ydotOrb) * cosi;
  const vyEcl = sinO * (cosw * xdotOrb - sinw * ydotOrb) + cosO * (sinw * xdotOrb + cosw * ydotOrb) * cosi;
  const vzEcl = (sinw * xdotOrb + cosw * ydotOrb) * sini;

  const sE = base.SOblJ2000;
  const cE = base.COblJ2000;

  const x = xEcl;
  const y = cE * yEcl - sE * zEcl;
  const z = sE * yEcl + cE * zEcl;

  const vx = vxEcl;
  const vy = cE * vyEcl - sE * vzEcl;
  const vz = sE * vyEcl + cE * vzEcl;

  return { x, y, z, vx, vy, vz };
}

export function createSmallBodyMeshes(toi) {
  const bodies = {};
  const objects = [];
  const states = [];
  for (const body of SMALL_BODIES) {
    const mesh = createSphereMesh(0.05, body.color);
    const orbit = createEllipseLine(body.elements);
    objects.push(mesh, orbit);
    const name = body.name.toLowerCase();
    bodies[name] = { mesh, elements: body.elements };
    const sv = stateVectorFromElements(body.elements, toi.getJulianDay());
    states.push(new StateVector(sv.x, sv.y, sv.z, sv.vx, sv.vy, sv.vz, toi.getDate()));
    bodies[name].index = states.length - 1;
  }
  bodies._sim = new GravitySimulator(Body.Sun, toi.getDate(), states);
  updateSmallBodyPositions(bodies, toi);
  return { objects, bodies };
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

export function updateSmallBodyPositions(bodies, toi) {
  if (!bodies._sim) {
    return;
  }
  const states = bodies._sim.Update(toi.getDate());
  for (const key of Object.keys(bodies)) {
    if (key === '_sim') continue;
    const body = bodies[key];
    const sv = states[body.index];
    body.mesh.position.set(sv.x * SCALE, sv.z * SCALE, sv.y * SCALE);
  }
}
