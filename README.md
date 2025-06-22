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
- Adjustable timeline speed
- Reset camera position with one click

## Getting Started

Install dependencies and then start the development server (the bundle is built automatically):

```bash
npm install
npm start
```

If `npm start` or `npm run serve` is run before installing dependencies, you'll
see an `esbuild: not found` error. Always run `npm install` first to download
all required packages.

Once the server is running, open `http://localhost:3000` in your browser.

You can also use the `deploy.sh` script to automatically pull the latest code,
install dependencies and start the server:

```bash
./deploy.sh
```

## Development

Rebuild the bundle whenever you update the code:

```bash
npm run build
```

## Roadmap

- Add all remaining planets and major moons (completed)
- Animated timeline for smooth time travel (completed)
- Highlight celestial events such as eclipses and conjunctions
- Optional VR/AR mode
- Ability to save and share favorite scenes
