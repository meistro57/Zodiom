import React, { useEffect } from 'react';

export default function UI() {
  useEffect(() => {
    window.dispatchEvent(new Event('ui-ready'));
  }, []);
  return (
    <div id="ui">
      <img id="logo" src="zodiom.png" alt="Zodiom logo" />
      <div className="control">
        <label>Date &amp; Time:
          <input type="datetime-local" id="datetime" />
        </label>
        <button id="go">Go</button>
      </div>
      <label className="control">
        Mystic Mode
        <input type="checkbox" id="mysticToggle" />
      </label>
      <label className="control">
        Light Mode
        <input type="checkbox" id="lightToggle" />
      </label>
      <label className="control">
        Show Labels
        <input type="checkbox" id="labelToggle" defaultChecked />
      </label>
      <label className="control">
        Show Orbits
        <input type="checkbox" id="orbitToggle" defaultChecked />
      </label>
      <label className="control">
        Show ISS
        <input type="checkbox" id="issToggle" defaultChecked />
      </label>
      <label className="control">
        Speed
        <input type="range" id="speedRange" min="0.1" max="5" step="0.1" defaultValue="1" />
      </label>
      <button id="playTimeline" className="control">Play Timeline</button>
      <button id="resetCamera" className="control">Reset Camera</button>
    </div>
  );
}
