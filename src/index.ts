import { OpeningTimes, Space } from "./types";

const NO_AVAILABILITY = {};

/**
 * Fetches upcoming availability for a space
 * @param space The space to fetch the availability for
 * @param numberOfDays The number of days from `now` to fetch availability for
 * @param now The time now
 */
export const fetchAvailability = (
  space: Space,
  numberOfDays: number,
  now: Date
): Record<string, OpeningTimes> => {
  // Your implementation here

  const correctTimezoneDate = convertTimeZone(now, space.timeZone);
  const spaveAvailabilityOnGivenDay = space.openingTimes[correctTimezoneDate.getDay()]
  const normalizedDate = roundTimeToFuture15Minutes(addAdvancedNoticeInMinutes(correctTimezoneDate, space.minimumNotice));

  // if at the end of the day
  if (normalizedDate.getDate() !== correctTimezoneDate.getDate()) {
    return generateAvailability(correctTimezoneDate, NO_AVAILABILITY)
  }

  const { open, close } = spaveAvailabilityOnGivenDay;

  if (!open || !close) return generateAvailability(correctTimezoneDate, NO_AVAILABILITY);

  const beginHours = normalizedDate.getHours();
  const beginMinutes = normalizedDate.getMinutes();

  // if before opening times
  if (beginHours < open.hour || (beginHours === open.hour && beginMinutes < open.minute)) {
    return generateAvailability(correctTimezoneDate, { open, close })
  }

  // if after opening times
  if (beginHours > close.hour || (beginHours === close.hour && beginMinutes > close.minute)) {
    return generateAvailability(correctTimezoneDate, NO_AVAILABILITY)
  }

  return generateAvailability(correctTimezoneDate, { open: { hour: beginHours, minute: beginMinutes }, close })
};


function convertTimeZone(date: Date, tzString: string): Date {
  return new Date(date.toLocaleString("en-US", { timeZone: tzString }));
}

function roundTimeToFuture15Minutes(date: Date): Date {
  const cpy = new Date(date);
  const extraMinutes = cpy.getMinutes() % 15;
  if (extraMinutes === 0) return cpy;

  return addMinutes(cpy, 15 - extraMinutes)
}

function addAdvancedNoticeInMinutes(date: Date, minutes: number): Date {
  return addMinutes(date, minutes)
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

function generateAvailability(date: Date, openingTimes: OpeningTimes): Record<string, OpeningTimes> {
  const key = date.toISOString().slice(0, 10);
  return { [key]: openingTimes }
}