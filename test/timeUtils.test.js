import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseDateTime, advanceTime } from '../src/timeUtils.js';

function nearlyEqual(a, b, tolMs = 1000) {
  return Math.abs(a - b) <= tolMs;
}

describe('parseDateTime', () => {
  it('parses ISO date strings into TimeOfInterest objects', () => {
    const toi = parseDateTime('2020-01-02T03:04:05Z');
    assert.equal(toi.getDate().toISOString(), '2020-01-02T03:04:05.000Z');
  });

  it('returns current time when value is empty', () => {
    const before = Date.now();
    const toi = parseDateTime('');
    const after = Date.now();
    const t = toi.getDate().getTime();
    assert.ok(nearlyEqual(t, before) || (t > before && t <= after));
  });

  it('advances time by given milliseconds', () => {
    const toi = parseDateTime('2020-01-01T00:00:00Z');
    const advanced = advanceTime(toi, 24 * 60 * 60 * 1000); // plus one day
    assert.equal(advanced.getDate().toISOString(), '2020-01-02T00:00:00.000Z');
  });
});
