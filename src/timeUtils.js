import {createTimeOfInterest} from 'astronomy-bundle/time/index.js';

export function parseDateTime(value) {
  if (!value) {
    return createTimeOfInterest.fromCurrentTime();
  }
  const date = new Date(value);
  if (isNaN(date)) {
    return createTimeOfInterest.fromCurrentTime();
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
