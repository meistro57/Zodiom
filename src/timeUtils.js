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
