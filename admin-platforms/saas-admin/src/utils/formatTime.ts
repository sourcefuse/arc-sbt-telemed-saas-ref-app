import { format, getTime, formatDistanceToNow, secondsToMinutes } from 'date-fns';
import { padStart } from 'lodash';

// ----------------------------------------------------------------------

type InputValue = Date | string | number | null;

export function fDate(date: InputValue, newFormat?: string) {
  const fm = newFormat || 'dd MMM yyyy';

  return date ? format(new Date(date), fm) : '';
}

export function fDateTime(date: InputValue, newFormat?: string) {
  const fm = newFormat || 'dd MMM yyyy p';

  return date ? format(new Date(date), fm) : '';
}

export function fTimestamp(date: InputValue) {
  return date ? getTime(new Date(date)) : '';
}

export function fToNow(date: InputValue) {
  return date
    ? formatDistanceToNow(new Date(date), {
      addSuffix: true,
    })
    : '';
}

/**
 * Converts an ISO-8601 formatted date and time string into a human-readable date.
 * @param dateString - The ISO-8601 formatted date and time string.
 * @returns A human-readable date in the format "5th Jan 2023".
 */
export function convertToHumanReadable(dateString: string) {
  // Create a new JavaScript Date object from the ISO-8601 formatted date string
  const date = new Date(dateString);

  // Get the day of the month (1-31) from the date object
  const day = date.getDate();

  // Get the month (0-11) from the date object and use it to get the corresponding month name
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const month = monthNames[date.getMonth()];

  // Get the full year (e.g. 2021) from the date object
  const year = date.getFullYear();

  // Create the human-readable date string by concatenating the day, month name, and year
  // Use the `getOrdinal` function (defined below) to add the ordinal suffix (e.g. "st", "nd", "rd") to the day
  const humanReadableDate = `${day}${getOrdinal(day)} ${month} ${year}`;

  return humanReadableDate;
}

/**
 * Returns the ordinal suffix (e.g. "st", "nd", "rd") for a given day (1-31).
 * @param day - The day of the month (1-31).
 * @returns The ordinal suffix for the day.
 */
export function getOrdinal(day: number): string {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

export function getPlayerDuration(seconds: number) {
  let minutes = secondsToMinutes(seconds).toString();
  minutes = padStart(minutes, 2, '0');

  let remainingSeconds = (parseInt(seconds.toString()) % 60).toString();
  remainingSeconds = padStart(remainingSeconds, 2, '0');

  return `${minutes}:${remainingSeconds}`;
}
