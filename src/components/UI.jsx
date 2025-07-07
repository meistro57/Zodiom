import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function UI() {
  useEffect(() => {
    window.dispatchEvent(new Event('ui-ready'));
  }, []);
  return (
    <motion.div
      id="ui"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm p-3 rounded-lg flex flex-col gap-2 max-w-xs text-sm text-white"
    >
      <img id="logo" src="/zodiom.png" alt="Zodiom logo" className="w-full mb-1" />
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1">Date &amp; Time:
          <input type="datetime-local" id="datetime" className="text-black" />
        </label>
        <button id="go" className="px-2 py-1 bg-white/20 rounded">Go</button>
      </div>
      <label className="flex items-center justify-between">
        Mystic Mode
        <input type="checkbox" id="mysticToggle" />
      </label>
      <label className="flex items-center justify-between">
        Light Mode
        <input type="checkbox" id="lightToggle" />
      </label>
      <label className="flex items-center justify-between">
        Show Labels
        <input type="checkbox" id="labelToggle" defaultChecked />
      </label>
      <label className="flex items-center justify-between">
        Show Orbits
        <input type="checkbox" id="orbitToggle" defaultChecked />
      </label>
      <label className="flex items-center justify-between">
        Show ISS
        <input type="checkbox" id="issToggle" defaultChecked />
      </label>
      <label className="flex items-center justify-between">
        Speed
        <input type="range" id="speedRange" min="0.1" max="5" step="0.1" defaultValue="1" />
      </label>
      <button id="playTimeline" className="px-2 py-1 bg-white/20 rounded">Play Timeline</button>
      <button id="resetCamera" className="px-2 py-1 bg-white/20 rounded">Reset Camera</button>
    </motion.div>
  );
}
