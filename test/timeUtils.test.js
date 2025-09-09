import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseDateTime, advanceTime, randomDateTime, formatDateTime } from '../src/timeUtils.js';

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

  it('returns current time for invalid input', () => {
    const before = Date.now();
    const toi = parseDateTime('not-a-date');
    const after = Date.now();
    const t = toi.getDate().getTime();
    assert.ok(nearlyEqual(t, before) || (t > before && t <= after));
  });

  it('returns current time for out-of-range dates', () => {
    const before = Date.now();
    const toi = parseDateTime('2020-02-30T00:00:00Z');
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

describe('randomDateTime and formatDateTime', () => {
  it('generates a date within the given year range', () => {
    const r = randomDateTime(2000, 2001);
    const year = r.getDate().getUTCFullYear();
    assert.ok(year === 2000 || year === 2001);
  });

  it('formats a TimeOfInterest to ISO string', () => {
    const toi = parseDateTime('2030-05-06T07:08:09Z');
    assert.equal(formatDateTime(toi), '2030-05-06T07:08:09.000Z');
  });
});
