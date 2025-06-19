import {createTimeOfInterest} from 'astronomy-bundle/time';

export function parseDateTime(value) {
  if (!value) {
    return createTimeOfInterest.fromCurrentTime();
  }
  const date = new Date(value);
  return createTimeOfInterest.fromDate(date);
}
