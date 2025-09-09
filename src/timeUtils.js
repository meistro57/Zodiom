import {createTimeOfInterest} from 'astronomy-bundle/time/index.js';

export function parseDateTime(value) {
  if (!value) {
    return createTimeOfInterest.fromCurrentTime();
  }
  const date = new Date(value);
  // Guard against unparsable or out-of-range dates (e.g. Feb 30)
  if (Number.isNaN(date.getTime())) {
    return createTimeOfInterest.fromCurrentTime();
  }
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(?:Z)?$/
  );
  if (match) {
    const [, y, m, d, hh, mm, ss = '00'] = match;
    const [year, month, day, hour, minute, second] = [y, m, d, hh, mm, ss].map(Number);
    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() + 1 !== month ||
      date.getUTCDate() !== day ||
      date.getUTCHours() !== hour ||
      date.getUTCMinutes() !== minute ||
      date.getUTCSeconds() !== second
    ) {
      return createTimeOfInterest.fromCurrentTime();
    }
  }
  return createTimeOfInterest.fromDate(date);
}

export function advanceTime(toi, deltaMs) {
  const newDate = new Date(toi.getDate().getTime() + deltaMs);
  return createTimeOfInterest.fromDate(newDate);
}

export function formatDateTime(toi) {
  return toi.getDate().toISOString();
}

export function randomDateTime(startYear = 1950, endYear = 2050) {
  const start = Date.UTC(startYear, 0, 1);
  const end = Date.UTC(endYear, 11, 31, 23, 59, 59);
  const ts = start + Math.random() * (end - start);
  return createTimeOfInterest.fromDate(new Date(ts));
}
