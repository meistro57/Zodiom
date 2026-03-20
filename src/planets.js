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
import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare.js';

const SCALE = 5;
const MOON_DISTANCE_MULTIPLIER = 50;
const ISS_ORBIT_RADIUS = 0.3;

const loader = new THREE.TextureLoader();
loader.setCrossOrigin('anonymous');

// ─── Fallback 1×1 textures so shaders never sample null ───────────────────────
function makeDataTexture(r, g, b, a = 255) {
  const tex = new THREE.DataTexture(new Uint8Array([r, g, b, a]), 1, 1, THREE.RGBAFormat);
  tex.needsUpdate = true;
  return tex;
}
const BLACK_TEX = makeDataTexture(0, 0, 0);
const WHITE_TEX = makeDataTexture(255, 255, 255);

// ─── Procedural canvas textures ────────────────────────────────────────────────
function makeCoronaTexture() {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 256;
  const ctx = cv.getContext('2d');
  const g = ctx.createRadialGradient(128, 128, 28, 128, 128, 128);
  g.addColorStop(0.00, 'rgba(255,235,160,0.95)');
  g.addColorStop(0.15, 'rgba(255,185, 80,0.70)');
  g.addColorStop(0.40, 'rgba(255,120, 30,0.30)');
  g.addColorStop(0.70, 'rgba(255, 80, 10,0.10)');
  g.addColorStop(1.00, 'rgba(255, 50,  0,0.00)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(cv);
}

function makeFlareTexture(size = 64) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const c = size / 2;
  const ctx = cv.getContext('2d');
  const g = ctx.createRadialGradient(c, c, 0, c, c, c);
  g.addColorStop(0.00, 'rgba(255,255,210,1.0)');
  g.addColorStop(0.25, 'rgba(255,200,100,0.7)');
  g.addColorStop(0.60, 'rgba(255,150, 50,0.3)');
  g.addColorStop(1.00, 'rgba(255, 80,  0,0.0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(cv);
}

// ─── Standard sphere mesh ──────────────────────────────────────────────────────
function createSphereMesh(radius, color, texturePath, segments = 64, receiveShadow = false, options = {}) {
  const { useEmissiveMap = false, emissiveIntensity = 1 } = options;
  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  const material = new THREE.MeshStandardMaterial({ color });
  loader.load(texturePath, tex => {
    material.map = tex;
    if (useEmissiveMap) {
      material.emissiveMap = tex;
      material.emissive = new THREE.Color(0xffffff);
      material.emissiveIntensity = emissiveIntensity;
    }
    material.color.set(0xffffff);
    material.needsUpdate = true;
  }, undefined, () => {});
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

// ─── Earth custom shader mesh (eclipse + day/night + clouds) ──────────────────
const EARTH_VERT = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  void main() {
    vUv = uv;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPosition = wp.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const EARTH_FRAG = `
  uniform sampler2D dayTexture;
  uniform sampler2D nightTexture;
  uniform sampler2D cloudsTexture;
  uniform vec3 sunPosition;
  uniform vec3 moonPosition;
  uniform float moonRadius;
  uniform float sunRadius;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vec3 normal   = normalize(vNormal);
    vec3 toSun    = normalize(sunPosition - vWorldPosition);

    // Day / night terminator
    float sunDot  = dot(normal, toSun);
    float dayMix  = smoothstep(-0.1, 0.1, sunDot);

    vec4 dayColor    = texture2D(dayTexture,    vUv);
    vec4 nightColor  = texture2D(nightTexture,  vUv) * 2.5;
    vec4 cloudsColor = texture2D(cloudsTexture, vUv);

    vec4 surfaceColor = mix(nightColor, dayColor, dayMix);
    surfaceColor = mix(surfaceColor, cloudsColor + surfaceColor * 0.5, cloudsColor.r * 0.6);

    // ── Eclipse shadow ──
    vec3 toMoon    = moonPosition - vWorldPosition;
    vec3 toSunDir  = normalize(sunPosition - vWorldPosition);
    float proj     = dot(toMoon, toSunDir);
    vec3 closest   = vWorldPosition + toSunDir * proj - moonPosition;
    float shadowDist = length(closest);

    float umbra    = moonRadius * 0.9;
    float penumbra = moonRadius * 2.5;
    float shadowFactor = 1.0 - smoothstep(umbra, penumbra, shadowDist);
    shadowFactor  *= step(0.0, proj);   // only sun-facing side
    shadowFactor  *= dayMix;            // only lit area

    // Reddish penumbra, like real total eclipse
    vec3 penumbraColor   = mix(surfaceColor.rgb, surfaceColor.rgb * vec3(0.6, 0.2, 0.1), shadowFactor * 0.7);
    float umbralDarkness = 1.0 - shadowFactor * 0.95;

    gl_FragColor = vec4(penumbraColor * umbralDarkness, 1.0);
  }
`;

function createEarthMesh() {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      dayTexture:    { value: WHITE_TEX },
      nightTexture:  { value: BLACK_TEX },
      cloudsTexture: { value: BLACK_TEX },
      sunPosition:   { value: new THREE.Vector3() },
      moonPosition:  { value: new THREE.Vector3() },
      moonRadius:    { value: 0.05 },
      sunRadius:     { value: 0.5  },
    },
    vertexShader:   EARTH_VERT,
    fragmentShader: EARTH_FRAG,
  });
  loader.load('textures/earth.jpg',       tex => { material.uniforms.dayTexture.value    = tex; });
  loader.load('textures/earth_night.jpg', tex => { material.uniforms.nightTexture.value  = tex; },
    undefined, () => { /* missing – keep black fallback */ });
  loader.load('textures/earth_clouds.jpg', tex => { material.uniforms.cloudsTexture.value = tex; },
    undefined, () => {});

  const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.2, 64, 64), material);
  mesh.castShadow = true;
  return { mesh, material };
}

// ─── Atmospheric limb glow (BackSide trick) ────────────────────────────────────
const ATMO_VERT = `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  void main() {
    // always outward regardless of BackSide
    vNormal = normalize(mat3(modelMatrix) * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPosition = wp.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ATMO_FRAG = `
  uniform vec3 sunPosition;
  uniform vec3 darkColor;
  uniform vec3 litColor;
  uniform float rimPower;
  uniform float rimAlpha;

  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    float rim = 1.0 - dot(vNormal, viewDir);
    rim = pow(clamp(rim, 0.0, 1.0), rimPower);

    vec3 toSun    = normalize(sunPosition - vWorldPosition);
    float sunFace = dot(vNormal, toSun) * 0.5 + 0.5;

    vec3 col = mix(darkColor, litColor, sunFace);
    gl_FragColor = vec4(col * rim, rim * rimAlpha);
  }
`;

function createAtmosphere(sphereRadius, darkColor, litColor, rimPower, rimAlpha) {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      sunPosition: { value: new THREE.Vector3() },
      darkColor:   { value: new THREE.Vector3(...darkColor) },
      litColor:    { value: new THREE.Vector3(...litColor)  },
      rimPower:    { value: rimPower },
      rimAlpha:    { value: rimAlpha },
    },
    vertexShader:   ATMO_VERT,
    fragmentShader: ATMO_FRAG,
    side:        THREE.BackSide,
    transparent: true,
    depthWrite:  false,
    blending:    THREE.AdditiveBlending,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(sphereRadius, 64, 64), material);
  return { mesh, material };
}

// ─── Sun corona planes ─────────────────────────────────────────────────────────
function createSunCorona(sunMesh) {
  const tex = makeCoronaTexture();
  const planes = [];
  const sizes  = [1.6, 2.0, 2.4];

  sizes.forEach((s, i) => {
    const mat = new THREE.MeshBasicMaterial({
      map:         tex,
      transparent: true,
      blending:    THREE.AdditiveBlending,
      depthWrite:  false,
      side:        THREE.DoubleSide,
      opacity:     0.55 - i * 0.08,
    });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(s, s), mat);
    plane.rotation.y = (i * Math.PI) / 3;
    sunMesh.add(plane);
    planes.push(plane);
  });
  return planes;
}

// ─── Lens flare ────────────────────────────────────────────────────────────────
function createSunLensflare(sunMesh) {
  const flareA = makeFlareTexture(128);
  const flareB = makeFlareTexture(64);
  const lf = new Lensflare();
  lf.addElement(new LensflareElement(flareA, 640, 0,   new THREE.Color(1.0, 0.88, 0.50)));
  lf.addElement(new LensflareElement(flareB,  60, 0.6, new THREE.Color(1.0, 0.70, 0.30)));
  lf.addElement(new LensflareElement(flareB,  70, 0.7, new THREE.Color(1.0, 0.80, 0.40)));
  lf.addElement(new LensflareElement(flareB, 110, 1.0, new THREE.Color(0.9, 0.60, 0.20)));
  sunMesh.add(lf);
  return lf;
}

// ─── Saturn ring with proper UV mapping ───────────────────────────────────────
function createRingGeometryWithUVs(innerRadius, outerRadius, thetaSegs = 128, radialSegs = 3) {
  const verts    = [];
  const uvs      = [];
  const normals  = [];
  const indices  = [];

  for (let r = 0; r <= radialSegs; r++) {
    const rad = innerRadius + (r / radialSegs) * (outerRadius - innerRadius);
    for (let t = 0; t <= thetaSegs; t++) {
      const theta = (t / thetaSegs) * Math.PI * 2;
      verts.push(Math.cos(theta) * rad, Math.sin(theta) * rad, 0);
      normals.push(0, 0, 1);
      // u = radial (inner→outer), v = angular
      uvs.push(r / radialSegs, t / thetaSegs);
    }
  }

  for (let r = 0; r < radialSegs; r++) {
    for (let t = 0; t < thetaSegs; t++) {
      const a = r * (thetaSegs + 1) + t;
      const b = a + 1;
      const c = a + (thetaSegs + 1);
      const d = c + 1;
      indices.push(a, b, c, b, d, c);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setIndex(indices);
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute('normal',   new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute('uv',       new THREE.Float32BufferAttribute(uvs, 2));
  return geo;
}

function createImprovedRingMesh(innerRadius, outerRadius, texturePath) {
  const geo = createRingGeometryWithUVs(innerRadius, outerRadius);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    transparent: true,
    alphaTest: 0.01,
  });
  loader.load(texturePath, tex => {
    mat.map      = tex;
    mat.alphaMap = tex;
    mat.needsUpdate = true;
  }, undefined, () => {});
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.rotation.x = Math.PI / 2;
  return mesh;
}

// ─── Asteroid belt ─────────────────────────────────────────────────────────────
function createAsteroidBelt(count = 1000, innerRadius = 2.2 * SCALE, outerRadius = 3.2 * SCALE) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r     = THREE.MathUtils.lerp(innerRadius, outerRadius, Math.random());
    const theta = Math.random() * Math.PI * 2;
    const y     = (Math.random() - 0.5) * 0.1 * SCALE;
    positions[i * 3]     = Math.cos(theta) * r;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = Math.sin(theta) * r;
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0x888888, size: 0.03 }));
}

// ─── Main factory ──────────────────────────────────────────────────────────────
export function createPlanetMeshes(toi) {
  const sun     = createSun(toi);
  const mercury = createMercury(toi);
  const venus   = createVenus(toi);
  const earth   = createEarth(toi);
  const moon    = createMoon(toi);
  const mars    = createMars(toi);
  const jupiter = createJupiter(toi);
  const saturn  = createSaturn(toi);
  const uranus  = createUranus(toi);
  const neptune = createNeptune(toi);
  const pluto   = createPluto(toi);

  // Sun
  const sunMesh = createSphereMesh(0.5, 0xffff00, 'textures/sun.jpg', 64, false,
    { useEmissiveMap: true, emissiveIntensity: 1.5 });
  const coronaPlanes = createSunCorona(sunMesh);
  createSunLensflare(sunMesh);

  // Inner planets
  const mercuryMesh = createSphereMesh(0.10, 0xaaaaaa, 'textures/mercury.jpg', 64, true);
  const venusMesh   = createSphereMesh(0.15, 0xffddaa, 'textures/venus.jpg',   64, true);

  // Earth – custom shader
  const { mesh: earthMesh, material: earthMaterial } = createEarthMesh();

  // Earth atmosphere (blue limb)
  const earthAtmo = createAtmosphere(
    0.225,
    [0.00, 0.05, 0.20], [0.20, 0.50, 1.00],
    3.0, 0.85
  );
  earthMesh.add(earthAtmo.mesh);

  // Moon
  const moonMesh = createSphereMesh(0.05, 0xdddddd, 'textures/moon.jpg', 96, true);

  // Mars + thin pinkish atmosphere
  const marsMesh = createSphereMesh(0.15, 0xff5533, 'textures/mars.jpg', 64, true);
  const marsAtmo = createAtmosphere(
    0.165,
    [0.06, 0.02, 0.02], [0.55, 0.22, 0.15],
    5.0, 0.35
  );
  marsMesh.add(marsAtmo.mesh);

  // Venus + thick orange atmosphere
  const venusMeshObj = venusMesh;
  const venusAtmo = createAtmosphere(
    0.175,
    [0.18, 0.08, 0.00], [0.90, 0.65, 0.15],
    2.0, 0.90
  );
  venusMeshObj.add(venusAtmo.mesh);

  // Outer planets
  const jupiterMesh = createSphereMesh(0.30, 0xffaa33, 'textures/jupiter.jpg', 64, true);
  const saturnMesh  = createSphereMesh(0.25, 0xffcc88, 'textures/saturn.jpg',  64, true);

  // Saturn tilt – set initial z rotation so the planet and ring tilt together
  saturnMesh.rotation.z = 26.7 * Math.PI / 180;

  const saturnRing = createImprovedRingMesh(0.35, 0.55, 'textures/saturn_ring.png');
  saturnMesh.add(saturnRing);

  const uranusMesh  = createSphereMesh(0.22, 0x66bbff, 'textures/uranus.jpg',  64, true);
  const neptuneMesh = createSphereMesh(0.21, 0x4477ff, 'textures/neptune.jpg', 64, true);
  const plutoMesh   = createSphereMesh(0.10, 0xbbbbbb, 'textures/pluto.jpg',   64, true);
  const issMesh     = createCubeMesh(0.03, 0xffffff);

  // Orbit lines
  const mercuryOrbit = createPlanetOrbitLine('mercury');
  const venusOrbit   = createPlanetOrbitLine('venus');
  const earthOrbit   = createPlanetOrbitLine('earth');
  const moonOrbit    = createCircularOrbitLine(0.00257 * SCALE * MOON_DISTANCE_MULTIPLIER);
  const marsOrbit    = createPlanetOrbitLine('mars');
  const jupiterOrbit = createPlanetOrbitLine('jupiter');
  const saturnOrbit  = createPlanetOrbitLine('saturn');
  const uranusOrbit  = createPlanetOrbitLine('uranus');
  const neptuneOrbit = createPlanetOrbitLine('neptune');
  const plutoOrbit   = createPlutoOrbitLine();
  const issOrbit     = createCircularOrbitLine(ISS_ORBIT_RADIUS);
  const asteroidBelt = createAsteroidBelt();

  // Parent moon and ISS to Earth
  earthMesh.add(moonOrbit);
  earthMesh.add(issOrbit);
  earthMesh.add(moonMesh);
  earthMesh.add(issMesh);

  // Collect atmosphere materials for per-frame sun-position updates
  const atmosphereMaterials = {
    earth: earthAtmo.material,
    venus: venusAtmo.material,
    mars:  marsAtmo.material,
  };

  return {
    objects: [
      sunMesh, mercuryMesh, venusMesh, earthMesh,
      moonMesh, marsMesh, jupiterMesh, saturnMesh,
      uranusMesh, neptuneMesh, plutoMesh, issMesh,
      mercuryOrbit, venusOrbit, earthOrbit, moonOrbit,
      issOrbit, marsOrbit, jupiterOrbit, saturnOrbit,
      uranusOrbit, neptuneOrbit, plutoOrbit, asteroidBelt
    ],
    moonOrbit,
    issOrbit,
    bodies: {
      sun:     { mesh: sunMesh,     astro: sun     },
      mercury: { mesh: mercuryMesh, astro: mercury },
      venus:   { mesh: venusMesh,   astro: venus   },
      earth:   { mesh: earthMesh,   astro: earth   },
      moon:    { mesh: moonMesh,    astro: moon    },
      mars:    { mesh: marsMesh,    astro: mars    },
      jupiter: { mesh: jupiterMesh, astro: jupiter },
      saturn:  { mesh: saturnMesh,  astro: saturn  },
      uranus:  { mesh: uranusMesh,  astro: uranus  },
      neptune: { mesh: neptuneMesh, astro: neptune },
      pluto:   { mesh: plutoMesh,   astro: pluto   },
      iss:     { mesh: issMesh,     astro: null    },
    },
    earthMaterial,
    atmosphereMaterials,
    coronaPlanes,
  };
}

// ─── Orbital math (unchanged) ──────────────────────────────────────────────────
const RAD = Math.PI / 180;

function heliocentricCoords(el, jd) {
  const e = el.e, a = el.a;
  const inc   = el.i     * RAD;
  const Omega = el.Omega * RAD;
  const w     = el.w     * RAD;
  const M0    = el.M0    * RAD;
  const n     = base.K / a / Math.sqrt(a);
  const M     = M0 + n * (jd - el.epoch);
  let E;
  try { E = kepler2b(e, M, 8); } catch { E = kepler3(e, M); }
  const nu       = trueAnomaly(E, e);
  const r        = radius(E, e, a);
  const theta    = nu + w;
  const cosTheta = Math.cos(theta), sinTheta = Math.sin(theta);
  const cosO     = Math.cos(Omega), sinO     = Math.sin(Omega);
  const cosI     = Math.cos(inc),   sinI     = Math.sin(inc);
  return {
    x: r * (cosO * cosTheta - sinO * sinTheta * cosI),
    y: r * (sinO * cosTheta + cosO * sinTheta * cosI),
    z: r * (sinTheta * sinI),
  };
}

function createEllipseLine(el, segments = 180) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array((segments + 1) * 3);
  const n   = base.K / el.a / Math.sqrt(el.a);
  for (let i = 0; i <= segments; i++) {
    const M  = (i / segments) * 2 * Math.PI;
    const jd = el.epoch + M / n;
    const { x, y, z } = heliocentricCoords(el, jd);
    pos[i * 3]     = x * SCALE;
    pos[i * 3 + 1] = z * SCALE;
    pos[i * 3 + 2] = y * SCALE;
  }
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  return new THREE.LineLoop(geo, new THREE.LineBasicMaterial({ color: 0x888888 }));
}

function createPlanetOrbitLine(name, segments = 180) {
  const jd0    = 2451545.0;
  const elMean = planetElements.mean(name, jd0);
  const node   = isNaN(elMean.node) ? 0 : elMean.node;
  return createEllipseLine({
    a:     elMean.axis,
    e:     elMean.ecc,
    i:     elMean.inc  * 180 / Math.PI,
    Omega: node        * 180 / Math.PI,
    w:     (elMean.peri - node) * 180 / Math.PI,
    M0:    (elMean.lon  - elMean.peri) * 180 / Math.PI,
    epoch: jd0,
  }, segments);
}

function createCircularOrbitLine(radius, segments = 180) {
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(t) * radius, 0, Math.sin(t) * radius));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  return new THREE.LineLoop(geo, new THREE.LineBasicMaterial({ color: 0x888888 }));
}

function createPlutoOrbitLine(segments = 180) {
  const jd0    = 2451545.0;
  const period = PlanetOrbitalPeriod('Pluto');
  const pos    = new Float32Array((segments + 1) * 3);
  for (let i = 0; i <= segments; i++) {
    const jd = jd0 + period * (i / segments);
    const { lon, lat, range } = plutoHeliocentric(jd);
    pos[i * 3]     = range * Math.cos(lon) * Math.cos(lat) * SCALE;
    pos[i * 3 + 1] = range * Math.sin(lat) * SCALE;
    pos[i * 3 + 2] = range * Math.sin(lon) * Math.cos(lat) * SCALE;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  return new THREE.LineLoop(geo, new THREE.LineBasicMaterial({ color: 0x888888 }));
}

export async function updatePositions(bodies, toi) {
  bodies.sun.mesh.position.set(0, 0, 0);

  const ec = await bodies.earth.astro.getHeliocentricEclipticRectangularJ2000Coordinates();
  bodies.earth.mesh.position.set(ec.x * SCALE, ec.z * SCALE, ec.y * SCALE);

  const mc = await bodies.moon.astro.getGeocentricEclipticRectangularJ2000Coordinates();
  bodies.moon.mesh.position.set(
    mc.x * SCALE * MOON_DISTANCE_MULTIPLIER,
    mc.z * SCALE * MOON_DISTANCE_MULTIPLIER,
    mc.y * SCALE * MOON_DISTANCE_MULTIPLIER
  );

  for (const [name, body] of Object.entries(bodies)) {
    if (!['mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto'].includes(name)) continue;
    const c = await body.astro.getHeliocentricEclipticRectangularJ2000Coordinates();
    body.mesh.position.set(c.x * SCALE, c.z * SCALE, c.y * SCALE);
  }

  const t      = (toi.getDate ? toi.getDate() : toi).getTime() / 1000;
  const period = 92 * 60;
  const angle  = (t % period) / period * Math.PI * 2;
  bodies.iss.mesh.position.set(
    Math.cos(angle) * ISS_ORBIT_RADIUS, 0, Math.sin(angle) * ISS_ORBIT_RADIUS
  );
}
