# Zodiom

Zodiom is an in-browser 3D cosmic simulator built with Three.js and Astronomy Bundle. It lets you witness planetary alignments across time and toggle between photorealistic and mystical modes infused with sacred geometry. Made for stargazers, seekers and space enthusiasts.

## Features

- Real-time positions for all major planets, now including Pluto
- Travel to any date in history or the future
- Mystic Mode for a symbolic, sacred look
- Optional light mode for the UI
- Orbit controls to freely navigate the scene
- Animated timeline for smooth time travel
- Planet labels with optional toggle
- Toggle visibility of planetary orbits
- Visual asteroid belt between Mars and Jupiter
- Orbits for known asteroids and comets
- Watch the International Space Station orbit the Earth
- Toggle ISS visibility
- Increased Moon and ISS distance from Earth for improved visibility
- Adjustable timeline speed
- Reset camera position with one click
- Expanded starfield backdrop
- Toggle starfield visibility
- Jump to the current time with the Now button
- Physically accurate lighting and smoother camera controls
- Added Eros asteroid to the small bodies catalog
- HDR environment map placeholder for an Octane-style look (replace with your own .hdr file)
- Random Date button for surprise exploration
- Reverse timeline playback
- Toggle fullscreen mode
- Wireframe rendering option
- Reset timeline speed with one click

## Getting Started

Install dependencies and start the Astro development server (the Three.js bundle is built automatically):

```bash
npm install
npm run dev
```

If `npm run dev` or `npm run serve` is run before installing dependencies, you'll
see an `esbuild: not found` error. Always run `npm install` first to download
all required packages.

Once the server is running, open `http://localhost:4321` in your browser.

You can also use the `deploy.sh` script to automatically pull the latest code,
install dependencies and start the server:

```bash
./deploy.sh
```

## Development

Rebuild the bundle and Astro site whenever you update the code:

```bash
npm run build
```

After building you can serve the production build:

```bash
npm start
```

## Roadmap

- Add all remaining planets and major moons (completed)
- Animated timeline for smooth time travel (completed)
- Highlight celestial events such as eclipses and conjunctions
- Optional VR/AR mode
- Ability to save and share favorite scenes
