import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Sync a hidden checkbox and fire a change event so main.jsx hears it
function syncCheckbox(id, value) {
  const el = document.getElementById(id);
  if (el) {
    el.checked = value;
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

// Programmatically click a hidden button so main.jsx's listener fires
function clickHidden(id) {
  const el = document.getElementById(id);
  if (el) el.click();
}

function Toggle({ checked, onChange, label, icon }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="flex items-center gap-2 text-sm text-white/70">
        <span className="w-5 text-center text-base leading-none">{icon}</span>
        {label}
      </span>
      <button
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
          checked ? 'bg-indigo-500' : 'bg-white/20'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

function SectionHeader({ symbol, title }) {
  return (
    <div className="flex items-center gap-2 mb-1 mt-4 first:mt-0">
      <span className="text-indigo-400 text-xs leading-none">{symbol}</span>
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">{title}</span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}

function NavButton({ icon, label, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg transition-all border text-left leading-none ${
        active
          ? 'bg-violet-600/25 border-violet-400/35 text-violet-200 hover:bg-violet-600/40'
          : 'bg-white/5 border-white/10 text-white/65 hover:bg-white/12 hover:text-white'
      }`}
    >
      <span className="w-4 text-center flex-shrink-0 text-base">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export default function UI() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [playing, setPlaying]         = useState(false);
  const [speed, setSpeed]             = useState(1);
  const [reversed, setReversed]       = useState(false);
  const [showLabels, setShowLabels]   = useState(true);
  const [showOrbits, setShowOrbits]   = useState(true);
  const [showISS, setShowISS]         = useState(true);
  const [showStars, setShowStars]     = useState(true);
  const [mysticMode, setMysticMode]   = useState(false);
  const [lightMode, setLightMode]     = useState(false);
  const [wireframe, setWireframe]     = useState(false);

  useEffect(() => {
    window.dispatchEvent(new Event('ui-ready'));
  }, []);

  const handleToggle = (setter, id, value) => {
    setter(value);
    syncCheckbox(id, value);
  };

  const handlePlay = () => {
    setPlaying(p => !p);
    clickHidden('playTimeline');
  };

  const handleSpeedChange = (val) => {
    const v = parseFloat(val);
    setSpeed(v);
    const el = document.getElementById('speedRange');
    if (el) {
      el.value = v;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  const handleReverse = () => {
    setReversed(r => !r);
    clickHidden('reverseTime');
  };

  const handleResetSpeed = () => {
    setSpeed(1);
    const el = document.getElementById('speedRange');
    if (el) {
      el.value = 1;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  return (
    <>
      {/* ── Hidden elements that main.jsx wires up by ID ─────────────────── */}
      <div style={{ display: 'none' }} aria-hidden="true">
        <input type="checkbox" id="mysticToggle"    defaultChecked={false} />
        <input type="checkbox" id="lightToggle"     defaultChecked={false} />
        <input type="checkbox" id="labelToggle"     defaultChecked={true}  />
        <input type="checkbox" id="orbitToggle"     defaultChecked={true}  />
        <input type="checkbox" id="issToggle"       defaultChecked={true}  />
        <input type="checkbox" id="starsToggle"     defaultChecked={true}  />
        <input type="checkbox" id="wireframeToggle" defaultChecked={false} />
        <input type="range"    id="speedRange" min="0.1" max="5" step="0.1" defaultValue="1" />
        <button id="go">Go</button>
        <button id="now">Now</button>
        <button id="playTimeline">Play Timeline</button>
        <button id="resetCamera">Reset Camera</button>
        <button id="randomDate">Random Date</button>
        <button id="reverseTime">Reverse Time</button>
        <button id="resetSpeed">Reset Speed</button>
        <button id="fullscreen">Fullscreen</button>
      </div>

      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between gap-4 px-4 h-14 bg-black/50 backdrop-blur-xl border-b border-white/10"
      >
        {/* Logo */}
        <div className="flex items-center shrink-0">
          <img src="/zodiom.png" alt="Zodiom" className="h-8 w-auto" />
        </div>

        {/* Date / time — #datetime lives here; uncontrolled so main.jsx can read/write freely */}
        <div className="flex items-center gap-2 flex-1 justify-center max-w-lg">
          <input
            type="datetime-local"
            id="datetime"
            className="zodiom-datetime flex-1 min-w-0 bg-white/8 border border-white/15 rounded-lg px-3 py-1.5 text-sm text-white backdrop-blur-sm focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            onClick={() => clickHidden('go')}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg font-semibold transition-all shadow-lg shadow-indigo-900/40 shrink-0"
          >
            Go
          </button>
          <button
            onClick={() => clickHidden('now')}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-sm rounded-lg transition-all border border-white/10 shrink-0"
          >
            Now
          </button>
        </div>

        {/* Playback */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-[0.15em] text-white/35 hidden sm:block">SPEED</span>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={speed}
              onChange={e => handleSpeedChange(e.target.value)}
              className="zodiom-slider w-20 sm:w-28"
            />
            <span className="text-xs text-white/65 w-9 tabular-nums">{speed.toFixed(1)}x</span>
          </div>
          <button
            onClick={handlePlay}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg ${
              playing
                ? 'bg-violet-600 hover:bg-violet-500 shadow-violet-900/50 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/50 text-white'
            }`}
          >
            <span className="text-base leading-none">{playing ? '⏸' : '▶'}</span>
            <span>{playing ? 'Pause' : 'Play'}</span>
          </button>
        </div>
      </motion.header>

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <div className="fixed top-14 left-0 z-40 flex items-start">
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.nav
              key="sidebar"
              initial={{ x: -260, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -260, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="w-[260px] max-h-[calc(100vh-3.5rem)] bg-black/50 backdrop-blur-xl border-r border-white/10 px-4 pb-6 pt-3 overflow-y-auto zodiom-scroll"
            >
              {/* View */}
              <SectionHeader symbol="◎" title="View" />
              <Toggle checked={showLabels} onChange={v => handleToggle(setShowLabels, 'labelToggle', v)} label="Labels"    icon="🏷" />
              <Toggle checked={showOrbits} onChange={v => handleToggle(setShowOrbits, 'orbitToggle', v)} label="Orbits"    icon="⭕" />
              <Toggle checked={showStars}  onChange={v => handleToggle(setShowStars,  'starsToggle', v)} label="Stars"     icon="✦"  />
              <Toggle checked={showISS}    onChange={v => handleToggle(setShowISS,    'issToggle',   v)} label="ISS"       icon="🛰" />

              {/* Visual */}
              <SectionHeader symbol="◈" title="Visual" />
              <Toggle checked={mysticMode} onChange={v => handleToggle(setMysticMode, 'mysticToggle',    v)} label="Mystic Mode" icon="🔮" />
              <Toggle checked={lightMode}  onChange={v => handleToggle(setLightMode,  'lightToggle',     v)} label="Light Mode"  icon="☀"  />
              <Toggle checked={wireframe}  onChange={v => handleToggle(setWireframe,  'wireframeToggle', v)} label="Wireframe"   icon="⬡"  />

              {/* Navigation */}
              <SectionHeader symbol="◉" title="Navigation" />
              <div className="flex flex-col gap-1.5 mt-1">
                <NavButton icon="⊕" label="Reset Camera"                                  onClick={() => clickHidden('resetCamera')} />
                <NavButton icon="⚄" label="Random Date"                                   onClick={() => clickHidden('randomDate')}  />
                <NavButton
                  icon={reversed ? '⏩' : '⏪'}
                  label={reversed ? 'Forward Time' : 'Reverse Time'}
                  onClick={handleReverse}
                  active={reversed}
                />
                <NavButton icon="⚡" label="Reset Speed"  onClick={handleResetSpeed} />
                <NavButton icon="⛶" label="Fullscreen"    onClick={() => clickHidden('fullscreen')} />
              </div>
            </motion.nav>
          )}
        </AnimatePresence>

        {/* Collapse toggle */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => setSidebarOpen(o => !o)}
          title={sidebarOpen ? 'Collapse panel' : 'Expand panel'}
          className="mt-3 ml-1.5 w-7 h-7 flex items-center justify-center rounded-md bg-black/40 backdrop-blur-md border border-white/10 text-white/45 hover:text-white hover:bg-white/10 transition-all text-[11px]"
        >
          {sidebarOpen ? '◀' : '☰'}
        </motion.button>
      </div>
    </>
  );
}
