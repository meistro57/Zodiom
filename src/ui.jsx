import React, { useEffect } from 'react';

export default function UI() {
  useEffect(() => {
    window.dispatchEvent(new Event('ui-ready'));
  }, []);
  return (
    <div id="ui">
      <img id="logo" src="zodiom.png" alt="Zodiom logo" />
      <label>Date &amp; Time:
        <input type="datetime-local" id="datetime" />
      </label>
      <button id="go">Go</button>
      <label>
        Mystic Mode
        <input type="checkbox" id="mysticToggle" />
      </label>
      <label>
        Light Mode
        <input type="checkbox" id="lightToggle" />
      </label>
      <label>
        Show Labels
        <input type="checkbox" id="labelToggle" defaultChecked />
      </label>
      <label>
        Show Orbits
        <input type="checkbox" id="orbitToggle" defaultChecked />
      </label>
      <label>
        Show ISS
        <input type="checkbox" id="issToggle" defaultChecked />
      </label>
      <label>
        Speed
        <input type="range" id="speedRange" min="0.1" max="5" step="0.1" defaultValue="1" />
      </label>
      <button id="playTimeline">Play Timeline</button>
      <button id="resetCamera">Reset Camera</button>
    </div>
  );
}
