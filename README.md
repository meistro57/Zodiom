# Zodiom

Zodiom is an in-browser 3D cosmic simulator built with Three.js and Astronomy Bundle. Witness real-time planetary positions, solar eclipses, atmospheric effects, and the Milky Way — all rendered with physically accurate lighting and NASA-quality textures.

![Zodiom — Solar System Overview](screenshots/solar-system.png)

*Real-time solar system with NASA-quality textures, 20,000 stars, and HDR lighting*

![Zodiom — Solar Eclipse (2024-04-08)](screenshots/eclipse.png)

*Total solar eclipse — Moon's shadow with reddish penumbra crawling across Earth*

![Zodiom — Mystic Mode](screenshots/mystic-mode.png)

*Mystic Mode: sacred geometry aesthetic with glowing orbital paths*

## Features

### 🌍 Photorealistic Rendering
- NASA-quality planet textures for all bodies
- Earth with day/night terminator, city lights on the dark side, and cloud layer
- Custom GLSL atmosphere shader — Earth's iconic blue limb glow visible from space
- Physically accurate lighting via ACES filmic tonemapping and HDR environment map

### 🌑 Solar Eclipse System
- Real volumetric eclipse shadow cast by the Moon onto Earth
- Umbra + reddish penumbra gradient (just like a real total solar eclipse)
- Scrub the timeline to 2024-04-08 to watch the shadow crawl across North America

### ☀️ Sun Effects
- Animated pulsing corona with additive glow
- Realistic lens flare
- Solar surface rotation animation

### 🌌 Deep Space
- 20,000 stars with size and color variation (blue giants, orange dwarfs)
- Milky Way band concentrated along the galactic plane
- HDR space environment map

### 🪐 Planet Details
- Saturn with Cassini-quality ring system — proper radial UV, transparency variation, 26.7° tilt
- Uranus on its side (97.8° axial tilt)
- Planetary atmospheres: Earth (blue), Venus (yellow haze), Mars (pink tint)
- Asteroid belt with varied particle sizes

### ⏱️ Time Travel
- Real-time positions for all planets, Moon, Pluto, and ISS
- Travel to any date from 1950 to 2050
- Play/pause animated timeline with adjustable speed
- Reverse time playback
- Jump to now or a random date

### 🎛️ Modern UI
- Glassmorphism control panel with Space Grotesk + Orbitron fonts
- Collapsible sidebar with grouped controls
- Custom toggle switches
- Mystic Mode — sacred geometry aesthetic with glowing orbits
- Wireframe mode, label toggle, fullscreen support

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:4321` in your browser.

> ⚠️ Always run `npm install` before `npm run dev` — esbuild is a dev dependency.

## Build for Production

```bash
npm run build
npm start
```

Or use the deploy script:

```bash
./deploy.sh
```

## Try This

**See a total solar eclipse:**
1. Set date to `2024-04-08T18:00`
2. Click **Go**
3. Zoom in on Earth
4. Watch the Moon's shadow (with reddish penumbra) cross North America

## Roadmap

- [x] All planets + Moon, Pluto, ISS
- [x] Animated timeline
- [x] Photorealistic textures + HDR lighting
- [x] Eclipse shadow system
- [x] Earth atmosphere shader
- [x] Sun corona + lens flare
- [x] Milky Way starfield
- [ ] Conjunction/opposition detector
- [ ] Zodiac constellation overlay
- [ ] VR/AR mode
- [ ] Save & share scenes
- [ ] Planet info panel on click
